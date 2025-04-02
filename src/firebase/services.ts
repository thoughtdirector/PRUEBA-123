import { 
  ref, 
  set, 
  get, 
  child, 
  update, 
  onValue
} from 'firebase/database';
import { db } from './config';
// Agregar estas importaciones si no las tienes
import { query, orderByChild, limitToLast, startAt, endAt } from 'firebase/database';

export interface ParkStatistics {
  totalVisits: number;
  averagePlayTime: number; // en minutos
  totalRevenue: number;
  activeSessionsCount: number;
  completedSessionsCount: number;
  dailyVisits: {date: string, count: number}[];
  hourlyDistribution: {hour: string, count: number}[];
  topVisitors: {childName: string, visits: number}[];
}

export const getStatistics = async (): Promise<ParkStatistics> => {
  try {
    console.log("Obteniendo estadísticas del parque");
    const dbRef = ref(db, 'play_sessions');
    const snapshot = await get(dbRef);
    
    // Valores por defecto
    const stats: ParkStatistics = {
      totalVisits: 0,
      averagePlayTime: 0,
      totalRevenue: 0,
      activeSessionsCount: 0,
      completedSessionsCount: 0,
      dailyVisits: [],
      hourlyDistribution: Array.from({length: 24}, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        count: 0
      })),
      topVisitors: []
    };

    // No hay datos
    if (!snapshot.exists()) {
      console.log("No hay sesiones registradas para estadísticas");
      return stats;
    }

    // Variables para cálculos
    let totalPlayedMinutes = 0;
    let sessionsWithPlayTime = 0;
    const visitorCounts: Record<string, { name: string, count: number }> = {};
    const dailyVisitMap: Record<string, number> = {};
    
    // Procesar todas las sesiones
    snapshot.forEach((childSnapshot) => {
      const session = childSnapshot.val() as PlaySession;
      
      // Contar total de visitas
      stats.totalVisits++;
      
      // Contar sesiones activas vs completadas
      if (session.sessionActive) {
        stats.activeSessionsCount++;
      } else {
        stats.completedSessionsCount++;
        
        // Sumar ingresos para sesiones completadas
        if (session.price) {
          stats.totalRevenue += session.price;
        }
        
        // Calcular tiempo de juego promedio
        if (session.playedTime) {
          const minutesMatch = session.playedTime.match(/(\d+)/);
          if (minutesMatch && minutesMatch[1]) {
            const minutes = parseInt(minutesMatch[1], 10);
            totalPlayedMinutes += minutes;
            sessionsWithPlayTime++;
          }
        }
      }
      
      // Contar visitas por niño
      const visitorKey = `${session.childName}_${session.primaryKey}`;
      if (!visitorCounts[visitorKey]) {
        visitorCounts[visitorKey] = { name: session.childName, count: 0 };
      }
      visitorCounts[visitorKey].count += 1;
      
      // Contar visitas por día
      const sessionDate = new Date(session.startPlayTime).toISOString().split('T')[0];
      if (!dailyVisitMap[sessionDate]) {
        dailyVisitMap[sessionDate] = 0;
      }
      dailyVisitMap[sessionDate] += 1;
      
      // Distribución por hora
      const hourOfDay = new Date(session.startPlayTime).getHours();
      stats.hourlyDistribution[hourOfDay].count += 1;
      
      return false;
    });
    
    // Calcular tiempo promedio de juego
    if (sessionsWithPlayTime > 0) {
      stats.averagePlayTime = Math.round(totalPlayedMinutes / sessionsWithPlayTime);
    }
    
    // Ordenar y extraer top visitantes
    stats.topVisitors = Object.values(visitorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(visitor => ({
        childName: visitor.name,
        visits: visitor.count
      }));
    
    // Convertir mapa de visitas diarias a array y ordenar por fecha
    stats.dailyVisits = Object.entries(dailyVisitMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Últimos 14 días
    
    console.log("Estadísticas generadas:", stats);
    return stats;
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    throw error;
  }
};

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
  userData: any 
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
    console.log("Iniciando registro de usuario con datos:", userData);
    const primaryKey = generatePrimaryKey(userData);
    console.log("Primary key generada:", primaryKey);
    
    // Verificar si el usuario ya existe
    const userRef = ref(db, `users/${primaryKey}`);
    console.log("Verificando si el usuario existe en:", userRef.toString());
    
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      console.log("Usuario encontrado, retornando primaryKey existente:", primaryKey);
      return { success: true, primaryKey, isNewUser: false };
    }
    
    const userDataFormatted = {
      ...userData,
      primaryKey,
      registrationTime: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
    };
    
    // Guardar en la Realtime Database
    console.log("Guardando nuevo usuario en:", userRef.toString(), "con datos:", userDataFormatted);
    await set(userRef, userDataFormatted);
    console.log("Usuario guardado exitosamente con primaryKey:", primaryKey);
    
    return { success: true, primaryKey, isNewUser: true };
  } catch (error) {
    console.error("Error registrando usuario:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const getUserByPrimaryKey = async (primaryKey: string): Promise<GetUserResult> => {
  try {
    console.log("Buscando usuario con primaryKey:", primaryKey);
    const userRef = ref(db, `users/${primaryKey}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      console.log("Usuario encontrado:", snapshot.val());
      return { success: true, userData: snapshot.val() };
    } else {
      console.log("Usuario no encontrado con primaryKey:", primaryKey);
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const startPlayTime = async (primaryKey: string): Promise<StartPlayTimeResult> => {
  try {
    console.log("Iniciando tiempo de juego para primaryKey:", primaryKey);
    const userResult = await getUserByPrimaryKey(primaryKey);
    
    if (!userResult.success) {
      console.error("No se encontró el usuario:", userResult.error);
      return { success: false, error: userResult.error }; 
    }
    
    const userData = userResult.userData;
    console.log("Usuario encontrado:", userData);
    
    // Verificar si ya existe una sesión activa
    const dbRef = ref(db, 'play_sessions');
    console.log("Verificando sesiones activas en:", dbRef.toString());
    const sessionsSnapshot = await get(dbRef);
    
    if (sessionsSnapshot.exists()) {
      let hasActiveSession = false;
      sessionsSnapshot.forEach((childSnapshot) => {
        const session = childSnapshot.val();
        if (session.primaryKey === primaryKey && session.sessionActive === true) {
          hasActiveSession = true;
          console.log("Sesión activa encontrada:", childSnapshot.key);
          return true; // Breaks the forEach loop
        }
        return false;
      });
      
      if (hasActiveSession) {
        console.error("El niño ya tiene una sesión activa");
        return { success: false, error: "Child already has an active play session" };
      }
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
    const sessionRef = ref(db, `play_sessions/${sessionId}`);
    
    console.log("Guardando nueva sesión con ID:", sessionId, "y datos:", playTimeData);
    await set(sessionRef, playTimeData);
    console.log("Sesión guardada exitosamente");
    
    return { success: true, sessionId, playTimeData };
  } catch (error) {
    console.error("Error iniciando tiempo de juego:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const getActivePlaySessions = async (): Promise<GetActiveSessionsResult> => {
  try {
    console.log("Obteniendo sesiones activas");
    const dbRef = ref(db, 'play_sessions');
    const snapshot = await get(dbRef);
    const activeSessions: (PlaySession & { id: string })[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const session = childSnapshot.val();
        if (session.sessionActive === true) {
          activeSessions.push({
            id: childSnapshot.key as string,
            ...session
          });
        }
        return false;
      });
    }
    
    console.log("Sesiones activas encontradas:", activeSessions.length);
    return { success: true, activeSessions };
  } catch (error) {
    console.error("Error obteniendo sesiones activas:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const stopPlayTime = async (sessionId: string): Promise<StopPlayTimeResult> => {
  try {
    console.log("Finalizando tiempo de juego para sesión:", sessionId);
    const sessionRef = ref(db, `play_sessions/${sessionId}`);
    const snapshot = await get(sessionRef);
    
    if (!snapshot.exists()) {
      console.error("Sesión no encontrada");
      return { success: false, error: "Session not found" };
    }
    
    const sessionData = snapshot.val() as PlaySession;
    
    if (!sessionData.sessionActive) {
      console.error("La sesión ya ha finalizado");
      return { success: false, error: "Session already ended" };
    }
    
    const startTime = new Date(sessionData.startPlayTime);
    const stopTime = new Date();
    const timeDiffMs = stopTime.getTime() - startTime.getTime();
    const playedMinutes = Math.floor(timeDiffMs / 60000);
    
    let price = 0;
    
    const HALF_HOUR_RATE = 30000; 
    const FULL_HOUR_RATE = 50000; 
    
    if (playedMinutes < 30) {
      price = Math.ceil((playedMinutes / 30) * HALF_HOUR_RATE);
    } 
    else if (playedMinutes < 60) {
      const basePrice = HALF_HOUR_RATE;
      const additionalMinutes = playedMinutes - 30;
      const additionalPrice = Math.ceil((additionalMinutes / 30) * (FULL_HOUR_RATE - HALF_HOUR_RATE));
      price = basePrice + additionalPrice;
    }
    else {
      const completeHours = Math.floor(playedMinutes / 60);
      const basePrice = completeHours * FULL_HOUR_RATE;
      
      const remainingMinutes = playedMinutes % 60;
      
      let additionalPrice = 0;
      if (remainingMinutes > 0) {
        additionalPrice = Math.ceil((remainingMinutes / 60) * FULL_HOUR_RATE);
      }
      
      price = basePrice + additionalPrice;
    }
    
    const stopTimeFormatted = new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' });
    
    console.log(`Actualizando sesión con tiempo jugado: ${playedMinutes} minutos, precio: $${price}`);
    await update(sessionRef, {
      stopPlayTime: stopTimeFormatted,
      playedTime: `${playedMinutes} minutes`,
      price: price,
      sessionActive: false
    });
    console.log("Sesión actualizada exitosamente");
    
    return { 
      success: true, 
      playedMinutes, 
      price,
      stopTime: stopTimeFormatted 
    };
  } catch (error) {
    console.error("Error finalizando tiempo de juego:", error);
    return { success: false, error: (error as Error).message };
  }
};

export const subscribeToActiveSessions = (callback: (sessions: (PlaySession & { id: string })[]) => void) => {
  try {
    console.log("Suscribiéndose a cambios en sesiones activas");
    const sessionsRef = ref(db, 'play_sessions');
    
    // Configurar la escucha en tiempo real
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const sessions: (PlaySession & { id: string })[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const session = childSnapshot.val();
          if (session.sessionActive === true) {
            sessions.push({
              id: childSnapshot.key as string,
              ...session
            });
          }
          return false;
        });
      }
      
      console.log("Actualizando lista de sesiones activas:", sessions.length);
      callback(sessions);
    });
    
    // Devolver función para cancelar la escucha
    return unsubscribe;
  } catch (error) {
    console.error("Error suscribiéndose a sesiones activas:", error);
    return null;
  }
};

export default {
  registerUser,
  getUserByPrimaryKey,
  startPlayTime,
  getActivePlaySessions,
  stopPlayTime,
  subscribeToActiveSessions,
  getStatistics
};
