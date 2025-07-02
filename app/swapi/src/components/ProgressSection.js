import React from 'react';
import useAppStore from '../store/useAppStore';

const ProgressSection = () => {
  const { 
    progressUpdates, 
    loading, 
    clearProgress
  } = useAppStore();

  // Get progress indicator color based on type
  const getProgressColor = (type) => {
    switch (type) {
      case 'vectordb_init':
      case 'vectordb_ingest':
        return '#3498db'; // Blue
      case 'vectordb_complete':
      case 'query_complete':
        return '#27ae60'; // Green
      case 'vectordb_error':
        return '#e74c3c'; // Red
      case 'vectordb_warning':
        return '#f39c12'; // Orange
      case 'query_start':
      case 'query_step':
        return '#9b59b6'; // Purple
      default:
        return '#95a5a6'; // Gray
    }
  };

  return (
    <div className="progress-section">
      <div className="progress-header">
        <h3>Processing Progress</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {progressUpdates.length > 0 && (
            <button 
              onClick={clearProgress} 
              className="clear-progress-btn"
              disabled={loading}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {progressUpdates.length > 0 && (
        <div className="progress-updates">
          {progressUpdates.map((update, index) => (
            <div 
              key={index} 
              className="progress-item"
              style={{ borderLeft: `4px solid ${getProgressColor(update.type)}` }}
            >
              <div className="progress-header-item">
                <span className="progress-type">{update.type.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="progress-time">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="progress-message">{update.message}</div>
              {update.progress !== undefined && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${update.progress}%`,
                      backgroundColor: getProgressColor(update.type)
                    }}
                  ></div>
                  <span className="progress-text">{update.progress}%</span>
                </div>
              )}
              {update.processedEntities && update.totalEntities && (
                <div className="progress-details">
                  Processing: {update.processedEntities}/{update.totalEntities} entities
                </div>
              )}
              {update.entityType && update.entityProgress && update.entityTotal && (
                <div className="progress-details">
                  {update.entityType}: {update.entityProgress}/{update.entityTotal}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressSection;