export interface ParentChildData {
    parentName: string;
    parentId: string;
    contactNumber: string;
    childName: string;
    childId: string;
  }
  
  export interface UserData extends ParentChildData {
    primaryKey: string;
    registrationTime: string;
  }
  
  export interface PlaySession {
    id?: string;
    primaryKey: string;
    childName: string;
    parentName: string;
    startPlayTime: string;
    stopPlayTime: string | null;
    playedTime: string | null;
    price: number | null;
    sessionActive: boolean;
  }
  
  export type ChildrenPlaying = {
    id?: string;
    child_name: string;
    parent_name: string;
    active_time: string;
    start_time: string;
    stop_time?: string;
    primary_key?: string;
    sessionActive?: boolean;
  };
  
  export type ChildrenPlayingList = ChildrenPlaying[];
  
  export const convertToChildrenPlaying = (session: PlaySession): ChildrenPlaying => {
    return {
      id: session.id,
      child_name: session.childName,
      parent_name: session.parentName,
      active_time: session.playedTime || 'En curso',
      start_time: session.startPlayTime,
      stop_time: session.stopPlayTime || undefined,
      primary_key: session.primaryKey,
      sessionActive: session.sessionActive
    };
  };
  
  export const convertToPlaySession = (child: ChildrenPlaying): PlaySession => {
    return {
      id: child.id,
      primaryKey: child.primary_key || '',
      childName: child.child_name,
      parentName: child.parent_name,
      startPlayTime: child.start_time,
      stopPlayTime: child.stop_time || null,
      playedTime: child.active_time,
      price: null,
      sessionActive: child.sessionActive || true
    };
  };