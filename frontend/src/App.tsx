import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobbies from './pages/Lobbies';
import Landing from './pages/Landing';
import Information from './pages/Information';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import { Game } from './utilities'


function App() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing setCurrentGame={setCurrentGame} />}/>

          <Route path="lobbies" element={
            <ProtectedRoute>
              <Lobbies game={currentGame} />
            </ProtectedRoute>
          }/>

          <Route path="information" element={
            <ProtectedRoute>
              <Information />
            </ProtectedRoute>
          }/>

          <Route path="auth" element={<Auth />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
