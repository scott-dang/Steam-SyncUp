import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobbies from './pages/Lobbies';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />}/>

          <Route path="lobbies" element={
            <ProtectedRoute>
              <Lobbies />
            </ProtectedRoute>
          }/>

          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }/>

          <Route path="auth" element={<Auth />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
