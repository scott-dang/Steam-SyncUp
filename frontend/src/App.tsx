import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobbies from './pages/Lobbies';
import Landing from './pages/Landing';
import Settings from './pages/Settings';

export function addition(a: number, b: number) {
  return a + b;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="lobbies" element={<Lobbies />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
