import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders Recetteo home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const headingElement = screen.getByText(/Bienvenue sur Recetteo/i);
  expect(headingElement).toBeInTheDocument();
});
