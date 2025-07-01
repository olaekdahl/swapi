import React from 'react';
import useAppStore from '../store/useAppStore';

const ErrorDisplay = () => {
  const error = useAppStore((state) => state.error);

  if (!error) return null;

  return (
    <div className="error">
      <strong>Error:</strong> {error}
    </div>
  );
};

export default ErrorDisplay;