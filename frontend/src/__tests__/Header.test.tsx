import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import React from 'react';
import Header from '../components/Header';

describe('renders Header component as a non-authenticated user', () => {

  test('given a lobby route and non-authenticated user', () => {
      render(
        <MemoryRouter initialEntries={['/lobbies']}> 
          <Header currentGame={undefined} setCurrentGame={undefined} />
        </MemoryRouter>
      );

     // Check if the "Steam SyncUp" link is present
     expect(screen.getByText(/steam syncup/i)).toBeTruthy();

     // Check if the "Lobbies" link is not present (should only render when logged in)
     expect(screen.queryByText(/lobbies/i)).toBeFalsy();
   
     // Check if the "Settings" link is not present (should only render when logged in)
     expect(screen.queryByText(/settings/i)).toBeFalsy();
   
     // Check if the search input is not present (should only render on /lobbies)
     expect(screen.queryByPlaceholderText(/search/i)).toBeFalsy();
   
     // Check if the SteamButton image is present
     expect(screen.getByRole('link', { name: 'Steam SyncUp' })).toBeTruthy();
  });

  test('given a non-lobby route and non-authenticated user', () => {
      render(
        <MemoryRouter initialEntries={['/']}> 
          <Header currentGame={undefined} setCurrentGame={undefined} />
        </MemoryRouter>
      );

     // Check if the "Steam SyncUp" link is present
     expect(screen.getByText(/steam syncup/i)).toBeTruthy();

     // Check if the "Lobbies" link is not present (should only render when logged in)
     expect(screen.queryByText(/lobbies/i)).toBeFalsy();
   
     // Check if the "Settings" link is not present (should only render when logged in)
     expect(screen.queryByText(/settings/i)).toBeFalsy();
   
     // Check if the search input is not present (should only render on /lobbies)
     expect(screen.queryByPlaceholderText(/search/i)).toBeFalsy();
   
     // Check if the SteamButton image is present
     expect(screen.getByRole('link', { name: 'Steam SyncUp' })).toBeTruthy();
  });

});
