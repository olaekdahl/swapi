import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TemperatureSection from '../components/TemperatureSection';
import useAppStore from '../store/useAppStore';

// Mock the store
jest.mock('../store/useAppStore');

describe('TemperatureSection', () => {
  const mockSetTemperature = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.mockReturnValue({
      selectedModel: '',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
  });

  test('does not render when no model is selected', () => {
    const { container } = render(<TemperatureSection />);
    expect(container.firstChild).toBeNull();
  });

  test('does not render for GPT-5 models', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt-5',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
    
    const { container } = render(<TemperatureSection />);
    expect(container.firstChild).toBeNull();
  });

  test('does not render for gpt5 models (without dash)', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt5',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
    
    const { container } = render(<TemperatureSection />);
    expect(container.firstChild).toBeNull();
  });

  test('does not render for GPT-5-turbo models', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt-5-turbo',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
    
    const { container } = render(<TemperatureSection />);
    expect(container.firstChild).toBeNull();
  });

  test('renders for non-GPT-5 models', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt-4',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
    
    render(<TemperatureSection />);
    expect(screen.getByText(/Temperature: 0.7/)).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  test('displays correct temperature value', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt-4',
      temperature: 0.3,
      setTemperature: mockSetTemperature,
    });
    
    render(<TemperatureSection />);
    expect(screen.getByText(/Temperature: 0.3/)).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('0.3');
  });

  test('calls setTemperature when slider value changes', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt-4',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
    
    render(<TemperatureSection />);
    const slider = screen.getByRole('slider');
    
    fireEvent.change(slider, { target: { value: '0.9' } });
    
    expect(mockSetTemperature).toHaveBeenCalledWith(0.9);
  });

  test('shows hint text about temperature behavior', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt-4',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
    
    render(<TemperatureSection />);
    expect(screen.getByText(/Controls randomness: 0 = focused, 1 = creative/)).toBeInTheDocument();
  });

  test('shows range labels', () => {
    useAppStore.mockReturnValue({
      selectedModel: 'gpt-4',
      temperature: 0.7,
      setTemperature: mockSetTemperature,
    });
    
    render(<TemperatureSection />);
    expect(screen.getByText('0 (Focused)')).toBeInTheDocument();
    expect(screen.getByText('1 (Creative)')).toBeInTheDocument();
  });
});