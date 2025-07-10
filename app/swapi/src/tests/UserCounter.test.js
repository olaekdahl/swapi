import { render, screen, waitFor } from '@testing-library/react';
import UserCounter from '../components/UserCounter';

// Mock fetch API
global.fetch = jest.fn();

describe('UserCounter', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders user counter with initial count', async () => {
    // Mock API response
    fetch.mockResolvedValueOnce({
      json: async () => ({ count: 5, timestamp: new Date().toISOString() })
    });

    render(<UserCounter />);
    
    // Check if the component renders
    expect(screen.getByText(/users online/)).toBeInTheDocument();
    
    // Wait for the count to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('5 users online')).toBeInTheDocument();
    });
  });

  test('displays singular form for one user', async () => {
    // Mock API response for single user
    fetch.mockResolvedValueOnce({
      json: async () => ({ count: 1, timestamp: new Date().toISOString() })
    });

    render(<UserCounter />);
    
    // Wait for the count to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('1 user online')).toBeInTheDocument();
    });
  });

  test('handles fetch error gracefully', async () => {
    // Mock fetch to reject
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<UserCounter />);
    
    // Should still render the component with 0 users
    expect(screen.getByText('0 users online')).toBeInTheDocument();
    
    // Should log the error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user count:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('displays icon and text elements', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ count: 3, timestamp: new Date().toISOString() })
    });

    render(<UserCounter />);
    
    // Check for icon
    expect(screen.getByText('👥')).toBeInTheDocument();
    
    // Check for text
    await waitFor(() => {
      expect(screen.getByText('3 users online')).toBeInTheDocument();
    });
  });
});