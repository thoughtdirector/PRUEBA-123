import React from 'react';
import { ParkStatistics } from '../../firebase/services';

interface StatisticsProps {
  statistics: ParkStatistics;
  isLoading: boolean;
}

const Statistics: React.FC<StatisticsProps> = ({ statistics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center items-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card: Visitas Totales */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-500">Visitas Totales</h3>
          <p className="text-3xl font-bold">{statistics.totalVisits}</p>
        </div>
        
        {/* Card: Tiempo Promedio */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-500">Tiempo Promedio</h3>
          <p className="text-3xl font-bold">{statistics.averagePlayTime} min</p>
        </div>
        
        {/* Card: Sesiones Activas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-500">Sesiones Activas</h3>
          <p className="text-3xl font-bold">{statistics.activeSessionsCount}</p>
        </div>
        
        {/* Card: Ingresos Totales */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-500">Ingresos Totales</h3>
          <p className="text-3xl font-bold">${statistics.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visitas Diarias */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Visitas Diarias (Últimos 14 días)</h3>
          {statistics.dailyVisits.length > 0 ? (
            <div className="h-64">
              <div className="flex h-full items-end">
                {statistics.dailyVisits.map((day, index) => {
                  const maxCount = Math.max(...statistics.dailyVisits.map(d => d.count));
                  const height = day.count > 0 ? (day.count / maxCount) * 100 : 5;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex flex-col items-center flex-1"
                    >
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      >
                      </div>
                      <p className="text-xs mt-1 transform -rotate-45 origin-top-left">
                        {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">No hay datos disponibles</p>
          )}
        </div>
        
        {/* Visitantes Frecuentes */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Visitantes Frecuentes</h3>
          {statistics.topVisitors.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Niño</th>
                    <th className="text-right py-2">Visitas</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topVisitors.map((visitor, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2">{visitor.childName}</td>
                      <td className="text-right py-2">{visitor.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">No hay datos disponibles</p>
          )}
        </div>
      </div>
      
      {/* Distribución por Hora */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Distribución de Visitas por Hora</h3>
        {statistics.hourlyDistribution.some(hour => hour.count > 0) ? (
          <div className="h-40">
            <div className="flex h-full items-end">
              {statistics.hourlyDistribution.map((hour, index) => {
                const maxCount = Math.max(...statistics.hourlyDistribution.map(h => h.count));
                const height = hour.count > 0 ? (hour.count / maxCount) * 100 : 5;
                
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center flex-1"
                    title={`${hour.hour}: ${hour.count} visitas`}
                  >
                    <div 
                      className={`w-full ${hour.count > 0 ? 'bg-green-500' : 'bg-gray-200'} rounded-t`}
                      style={{ height: `${height}%` }}
                    >
                    </div>
                    {index % 3 === 0 && (
                      <p className="text-xs mt-1 transform">{hour.hour}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default Statistics;