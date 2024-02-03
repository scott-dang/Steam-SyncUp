import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Lobbies from '../pages/Lobbies';
import Settings from '../pages/Settings';

const routes = (
  <MemoryRouter initialEntries={['/']}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="lobbies" element={<Lobbies />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  </MemoryRouter>
);

test('renders Landing component for "/" route', () => {
  render(
    routes
  );

  // Check if the Landing component is rendered
  expect(screen.getByText(/landing/i)).toBeTruthy(); 
});

test('renders Lobbies component for "lobbies" route', () => {
  render(
    routes
  );

  // Check if there are two paragraphs with the text "lobbies"
  const lobbiesElements = screen.getAllByText(/lobbies/i);

  // Perform assertions on each element
  lobbiesElements.forEach((element, index) => {
    expect(element).toBeTruthy();
  });
});

test('renders Settings component for "/settings" route', () => {
  render(
    routes
  );

  // Check if the Settings component is rendered
  expect(screen.getByText(/settings/i)).toBeTruthy(); 
});