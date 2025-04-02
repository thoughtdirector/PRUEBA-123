import React, { useEffect, useState } from "react";
import {
  ChildrenPlaying,
  ChildrenPlayingList,
} from "../../types";

interface Props {
  childrenPlaying: ChildrenPlayingList;
  onStopTime: (child: ChildrenPlaying) => void;
}

const ChildrenPlayingTable = ({ childrenPlaying, onStopTime }: Props) => {
  const [elapsedTimes, setElapsedTimes] = useState<{ [key: string]: string }>({});
  
  // Actualizar el tiempo transcurrido cada segundo
  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedTimes: { [key: string]: string } = {};
      
      childrenPlaying.forEach(child => {
        // Solo calcular para sesiones activas
        if (child.sessionActive !== false) {
          const startTime = new Date(child.start_time);
          const now = new Date();
          const diffMs = now.getTime() - startTime.getTime();
          
          // Formatear como HH:MM:SS
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          updatedTimes[child.id || ''] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      });
      
      setElapsedTimes(updatedTimes);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [childrenPlaying]);

  if (childrenPlaying.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded text-center w-full">
        <p>No hay niños jugando actualmente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border-collapse border border-gray-300 bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Niño</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Padre/Madre</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Tiempo Activo</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Hora de Ingreso</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {childrenPlaying.map((child, index) => (
            <tr key={child.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="border border-gray-300 px-4 py-2 font-medium">
                {child.child_name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {child.parent_name}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center font-mono">
                {elapsedTimes[child.id || ''] || '00:00:00'}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {new Date(child.start_time).toLocaleTimeString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="px-3 py-1 rounded bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors"
                  onClick={() => onStopTime(child)}
                >
                  Finalizar Tiempo
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChildrenPlayingTable;