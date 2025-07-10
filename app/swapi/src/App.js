import React, { useEffect, useRef } from 'react';
import './App.css';
import useAppStore from './store/useAppStore';
import StatusSection from './components/StatusSection';
import ApiKeySection from './components/ApiKeySection';
import ModelSelection from './components/ModelSelection';
import QueryForm from './components/QueryForm';
import ProgressSection from './components/ProgressSection';
import ErrorDisplay from './components/ErrorDisplay';
import ResponseSection from './components/ResponseSection';
import EducationalTabsSection from './components/EducationalTabsSection';
import UserCounter from './components/UserCounter';

function App() {
  const { sessionId, addProgressUpdate, setStatus } = useAppStore();
  const eventSourceRef = useRef(null);

  // Initialize SSE connection
  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`/api/progress/${sessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'userCount') {
            // Dispatch custom event for user count updates
            const userCountEvent = new CustomEvent('userCountUpdate', { detail: event });
            window.dispatchEvent(userCountEvent);
          } else if (data.type !== 'connected') {
            addProgressUpdate(data);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId, addProgressUpdate]);

  // Check status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Failed to check status:', err.message);
      }
    };

    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [setStatus]);

  return (
    <div className="App">
      <UserCounter />
      <div className="container">
        <h1>Star Wars Natural Language Query</h1>
        <p>Ask questions about the Star Wars universe using natural language!</p>

        <StatusSection />
        
        <ApiKeySection />
        
        <ModelSelection />

        <QueryForm />

        <ProgressSection />

        <ResponseSection />

        <EducationalTabsSection />

        <ErrorDisplay />
      </div>
      
      {/* Version information */}
      <div className="version-info" style={{ 
        fontSize: '0.8em', 
        color: '#666', 
        textAlign: 'center', 
        marginTop: '2rem', 
        padding: '1rem',
        borderTop: '1px solid #eee'
      }}>
        Version: commit PLACEHOLDER_COMMIT_SHA<br/>
        Deployed: {new Date('PLACEHOLDER_DEPLOY_TIMESTAMP').toLocaleString()}
      </div>
    </div>
  );
}

export default App;
