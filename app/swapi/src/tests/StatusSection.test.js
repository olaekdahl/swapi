import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusSection from '../components/StatusSection';
import useAppStore from '../store/useAppStore';

// Mock the store
jest.mock('../store/useAppStore');

describe('StatusSection', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('renders nothing when status is null', () => {
    useAppStore.mockReturnValue(null);
    
    const { container } = render(<StatusSection />);
    expect(container.firstChild).toBeNull();
  });

  test('renders ready status correctly', () => {
    useAppStore.mockReturnValue({
      api: 'online',
      vectorDatabase: 'ready'
    });
    
    render(<StatusSection />);
    
    expect(screen.getByText(/System Status:/)).toBeInTheDocument();
    expect(screen.getByText(/API is online/)).toBeInTheDocument();
    expect(screen.getByText(/Vector database is ready/)).toBeInTheDocument();
  });

  test('renders pending status with initialization message', () => {
    useAppStore.mockReturnValue({
      api: 'online',
      vectorDatabase: 'not_initialized'
    });
    
    render(<StatusSection />);
    
    expect(screen.getByText(/System Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Vector database is not_initialized/)).toBeInTheDocument();
    expect(screen.getByText(/The vector database \(LanceDB\) initializes on first query/)).toBeInTheDocument();
  });

  test('applies correct CSS classes based on status', () => {
    useAppStore.mockReturnValue({
      api: 'online',
      vectorDatabase: 'ready'
    });
    
    const { container } = render(<StatusSection />);
    const statusDiv = container.firstChild;
    
    expect(statusDiv).toHaveClass('status');
    expect(statusDiv).toHaveClass('status-ready');
  });
});