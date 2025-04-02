import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    query, 
    where, 
    getDocs,
    onSnapshot,
    DocumentData
  } from 'firebase/firestore';
  import { db } from './config';
  
  export interface ParentChildData {
    parentName: string;
    parentId: string;
    contactNumber: string;
    childName: string;
    childId: string;
  }
  
  export interface PlaySession {
    primaryKey: string;
    childName: string;
    parentName: string;
    startPlayTime: string;
    stopPlayTime: string | null;
    playedTime: string | null;
    price: number | null;
    sessionActive: boolean;
  }
  
  export type RegisterUserResult = { 
    success: true; 
    primaryKey: string; 
    isNewUser: boolean 
  } | { 
    success: false; 
    error: string 
  };
  
  export type GetUserResult = { 
    success: true; 
    userData: DocumentData 
  } | { 
    success: false; 
    error: string 
  };
  
  export type StartPlayTimeResult = { 
    success: true; 
    sessionId: string; 
    playTimeData: PlaySession 
  } | { 
    success: false; 
    error: string 
  };
  
  export type StopPlayTimeResult = { 
    success: true; 
    playedMinutes: number; 
    price: number; 
    stopTime: string 
  } | { 
    success: false; 
    error: string 
  };
  
  export type GetActiveSessionsResult = { 
    success: true; 
    activeSessions: (PlaySession & { id: string })[] 
  } | { 
    success: false; 
    error: string 
  };
  
  export const generatePrimaryKey = (userData: ParentChildData): string => {
    const { parentName, parentId, contactNumber, childName, childId } = userData;
    const combinedString = `${parentName}${parentId}${contactNumber}${childName}${childId}`;
    
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return Math.abs(hash).toString();
  };
  
  export const registerUser = async (userData: ParentChildData): Promise<RegisterUserResult> => {
    try {
      const primaryKey = generatePrimaryKey(userData);
      const userRef = doc(db, "users", primaryKey);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { success: true, primaryKey, isNewUser: false };
      }
      
      const userDataFormatted = {
        ...userData,
        primaryKey,
        registrationTime: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
      };
      
      await setDoc(userRef, userDataFormatted);
      
      return { success: true, primaryKey, isNewUser: true };
    } catch (error) {
      console.error("Error registering user:", error);
      return { success: false, error: (error as Error).message };
    }
  };
  
  export const getUserByPrimaryKey = async (primaryKey: string): Promise<GetUserResult> => {
    try {
      const userRef = doc(db, "users", primaryKey);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { success: true, userData: userDoc.data() };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      console.error("Error getting user:", error);
      return { success: false, error: (error as Error).message };
    }
  };
  
  export const startPlayTime = async (primaryKey: string): Promise<StartPlayTimeResult> => {
    try {
      const userResult = await getUserByPrimaryKey(primaryKey);
      if (!userResult.success) {
        return { success: false, error: userResult.error }; 
      }
      
      const userData = userResult.userData;
      
      const sessionsQuery = query(
        collection(db, "play_sessions"), 
        where("primaryKey", "==", primaryKey),
        where("sessionActive", "==", true)
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      if (!querySnapshot.empty) {
        return { success: false, error: "Child already has an active play session" };
      }
      
      const playTimeData: PlaySession = {
        primaryKey,
        childName: userData.childName,
        parentName: userData.parentName,
        startPlayTime: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
        stopPlayTime: null,
        playedTime: null,
        price: null,
        sessionActive: true
      };
      
      const sessionId = `${primaryKey}_${Date.now()}`;
      const sessionRef = doc(db, "play_sessions", sessionId);
      
      await setDoc(sessionRef, playTimeData);
      
      return { success: true, sessionId, playTimeData };
    } catch (error) {
      console.error("Error starting play time:", error);
      return { success: false, error: (error as Error).message };
    }
  };
  
  export const getActivePlaySessions = async (): Promise<GetActiveSessionsResult> => {
    try {
      const sessionsQuery = query(
        collection(db, "play_sessions"), 
        where("sessionActive", "==", true)
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      const activeSessions: (PlaySession & { id: string })[] = [];
      
      querySnapshot.forEach((doc) => {
        activeSessions.push({
          id: doc.id,
          ...(doc.data() as PlaySession)
        });
      });
      
      return { success: true, activeSessions };
    } catch (error) {
      console.error("Error getting active sessions:", error);
      return { success: false, error: (error as Error).message };
    }
  };
  
  export const stopPlayTime = async (sessionId: string): Promise<StopPlayTimeResult> => {
    try {
      const sessionRef = doc(db, "play_sessions", sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        return { success: false, error: "Session not found" };
      }
      
      const sessionData = sessionDoc.data() as PlaySession;
      
      if (!sessionData.sessionActive) {
        return { success: false, error: "Session already ended" };
      }
      
      const startTime = new Date(sessionData.startPlayTime);
      const stopTime = new Date();
      const timeDiffMs = stopTime.getTime() - startTime.getTime();
      const playedMinutes = Math.floor(timeDiffMs / 60000);
      
      
      const hourlyRate = 1000; // pesos colombianos por hora
      const pricePerMinute = hourlyRate / 60;
      const price = Math.ceil(playedMinutes * pricePerMinute);
      
      const stopTimeFormatted = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
      
      await updateDoc(sessionRef, {
        stopPlayTime: stopTimeFormatted,
        playedTime: `${playedMinutes} minutes`,
        price: price,
        sessionActive: false
      });
      
      return { 
        success: true, 
        playedMinutes, 
        price,
        stopTime: stopTimeFormatted 
      };
    } catch (error) {
      console.error("Error stopping play time:", error);
      return { success: false, error: (error as Error).message };
    }
  };
  
  export const subscribeToActiveSessions = (callback: (sessions: (PlaySession & { id: string })[]) => void) => {
    try {
      const sessionsQuery = query(
        collection(db, "play_sessions"), 
        where("sessionActive", "==", true)
      );
      
      return onSnapshot(sessionsQuery, (snapshot) => {
        const sessions: (PlaySession & { id: string })[] = [];
        snapshot.forEach((doc) => {
          sessions.push({
            id: doc.id,
            ...(doc.data() as PlaySession)
          });
        });
        callback(sessions);
      });
    } catch (error) {
      console.error("Error subscribing to active sessions:", error);
      return null;
    }
  };
  
  export default {
    registerUser,
    getUserByPrimaryKey,
    startPlayTime,
    getActivePlaySessions,
    stopPlayTime,
    subscribeToActiveSessions
  };