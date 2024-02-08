import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import Header from '../components/header';

test('renders Header component with links and search input', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

   // Check if the "Steam SyncUp" link is present
   expect(screen.getByText(/steam syncup/i)).toBeTruthy();

   // Check if the "Lobbies" link is present
   expect(screen.getByText(/lobbies/i)).toBeTruthy();
 
   // Check if the "Settings" link is present
   expect(screen.getByText(/settings/i)).toBeTruthy();
 
   // Check if the search input is present
   expect(screen.getByPlaceholderText(/search/i)).toBeTruthy();
 
   // Check if the SteamButton image is present
   expect(screen.getByRole('link', { name: 'Steam SyncUp' })).toBeTruthy();
});
