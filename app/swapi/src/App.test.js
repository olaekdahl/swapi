import { render, screen } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  global.EventSource = function () {
    return {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn()
    };
  };
});

test('renders app header', () => {
  render(<App />);
  const header = screen.getByText(/Star Wars Natural Language Query/i);
  expect(header).toBeInTheDocument();
});
