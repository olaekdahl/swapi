import React from 'react';
import useAppStore from '../store/useAppStore';

const StatusSection = () => {
  const status = useAppStore((state) => state.status);

  if (!status) return null;

  return (
    <div className={`status ${status.vectorDatabase === 'ready' ? 'status-ready' : 'status-pending'}`}>
      <strong>System Status:</strong> API is {status.api}. 
      Vector database is {status.vectorDatabase}
      {status.vectorDatabase === 'not_initialized' && (
        <span>. The vector database (LanceDB) initializes on first query and may take a few minutes to provision.</span>
      )}
    </div>
  );
};

export default StatusSection;