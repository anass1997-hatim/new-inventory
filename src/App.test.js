import { render, screen } from '@testing-library/react';
import App from './App';

test('renders default app component', () => {
  render(<App />);
  const headingElement = screen.getByText(/default app component/i);
  expect(headingElement).toBeInTheDocument();
});