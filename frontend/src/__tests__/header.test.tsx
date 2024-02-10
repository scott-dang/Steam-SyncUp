import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import React from 'react';
import Header from '../components/header';

describe('renders Header component', () => {

  test('given a lobby route with links and with search input', () => {
      render(
        <MemoryRouter initialEntries={['/lobbies']}> 
          <Header />
        </MemoryRouter>
      );

     // Check if the "Steam SyncUp" link is present
     expect(screen.getByText(/steam syncup/i)).toBeTruthy();

     // Check if the "Lobbies" link is present
     expect(screen.getByText(/lobbies/i)).toBeTruthy();
   
     // Check if the "Settings" link is present
     expect(screen.getByText(/settings/i)).toBeTruthy();
   
     // Check if the search input is present (should only render on /lobbies)
     expect(screen.getByPlaceholderText(/search/i)).toBeTruthy();
   
     // Check if the SteamButton image is present
     expect(screen.getByRole('link', { name: 'Steam SyncUp' })).toBeTruthy();
  });

  test('given a non-lobby route with links and without search input', () => {
      render(
        <MemoryRouter initialEntries={['/']}> 
          <Header />
        </MemoryRouter>
      );

     // Check if the "Steam SyncUp" link is present
     expect(screen.getByText(/steam syncup/i)).toBeTruthy();

     // Check if the "Lobbies" link is present
     expect(screen.getByText(/lobbies/i)).toBeTruthy();
   
     // Check if the "Settings" link is present
     expect(screen.getByText(/settings/i)).toBeTruthy();
   
     // Check if the search input is not present (should only render on /lobbies)
     expect(screen.queryByPlaceholderText(/search/i)).toBeFalsy();
   
     // Check if the SteamButton image is present
     expect(screen.getByRole('link', { name: 'Steam SyncUp' })).toBeTruthy();
  });

});
