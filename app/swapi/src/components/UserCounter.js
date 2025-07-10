import React, { useState, useEffect } from 'react';

const UserCounter = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Fetch initial user count
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/users/count');
        const data = await response.json();
        setUserCount(data.count);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };

    fetchUserCount();

    // Listen for user count updates via custom events
    const handleUserCountUpdate = (event) => {
      try {
        const data = JSON.parse(event.detail.data);
        if (data.type === 'userCount') {
          setUserCount(data.count);
        }
      } catch (error) {
        console.error('Error parsing user count update:', error);
      }
    };

    window.addEventListener('userCountUpdate', handleUserCountUpdate);

    return () => {
      window.removeEventListener('userCountUpdate', handleUserCountUpdate);
    };
  }, []);

  return (
    <div className="user-counter">
      <span className="user-counter-icon">👥</span>
      <span className="user-counter-text">{userCount} user{userCount !== 1 ? 's' : ''} online</span>
    </div>
  );
};

export default UserCounter;