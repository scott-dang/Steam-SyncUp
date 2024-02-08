import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobbies from './pages/Lobbies';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import Auth from './pages/Auth';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="lobbies" element={<Lobbies />} />
        <Route path="settings" element={<Settings />} />
        <Route path="auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
