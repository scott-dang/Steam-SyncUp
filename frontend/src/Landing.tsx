import React from 'react';
import './App.css';
import Header from './components/header';
import Gameslist from './components/gameslist';

function Landing() {
  return (
    <div className="App h-screen">
      <Header></Header>
      {/* <Gameslist></Gameslist> */}
    </div>
  );
}

export default Landing;
