import '../App.css';
import Header from '../components/header';
import React from 'react';

function Landing() {
  return (
    <div className="bg-[#1A1A1A] h-screen">
      <Header></Header>
      <span className='text-8xl text-white'>This is the landing page.</span>
    </div>
  );
}

export default Landing;
