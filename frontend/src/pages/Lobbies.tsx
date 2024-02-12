import React, { useState, useEffect } from 'react';
import '../App.css';
import Header from '../components/header';
import Games from '../components/games.json'
import AllLobbies from '../components/lobbies.json'

function Lobbies() {
  return (
    <div className="">
      <Header></Header>
      <div className="flex flex-row h-screen text-white">
        <div className="bg-[#4C4C4C] w-1/4 text-xl font-bold"> {/* Increase width to 1/4 */}
          <p className="pt-2 text-center">
            Games
          </p>
          <hr className="h-px mb-8 mt-4 bg-white border-0 dark:bg-gray-500"/>
          <ul className=''>
            {Games.Games.map(game => 
              <li className='font-normal text-sm'>
                <a href='' className='flex pl-2'>
                  <img src='https://static.vecteezy.com/system/resources/previews/021/010/421/original/question-mark-square-vector.jpg' className='w-10'></img>
                  <button className='ml-2'>{game}</button>
                </a>
                <hr className="h-px my-8 bg-white border-0 dark:bg-gray-500"/>
              </li>
            )}
          </ul>
        </div>
        <div className="bg-[#212121] w-1/4 text-xl font-bold"> 
          <p className="pt-2 text-center">
            Lobbies
          </p>
          <ul className='pt-2'>
            <ul className='flex items-center justify-center'>
              <input
                type="text"
                placeholder="Search"
                className="text-white text-xs bg-transparent border border-white rounded-full px-2 py-1.5 text-center focus:outline-none"
                style={{ width: "90%" }}
              />
            </ul>
            <ul className='my-4 flex items-center justify-center'>
              <a href='' className='w-1/2'>
                <button className='text-white text-xs bg-transparent border border-white py-2 text-center focus:outline-none w-full'>Create Lobby</button>
              </a>
              <a href='' className='w-1/2'>
                <button className='text-white text-xs bg-transparent border border-white py-2 text-center focus:outline-none w-full'>My Lobby</button>
              </a>
            </ul>
            {AllLobbies.Lobbies.map(lobby => 
              <li className='font-normal text-sm'>
                <div className="flex mx-2 text-white text-xs items-center">
                  <p>{lobby.name}</p>
                  <a href='' className='ml-auto pl-2'>
                    <button className='bg-transparent border border-white rounded-full px-6 py-1 text-center focus:outline-none ml-2'>join</button>
                  </a>
                  <p className="ml-2">{lobby.players}/5</p> 
                </div>
                <hr className="h-px my-4 bg-white border-0 dark:bg-gray-500"/>
              </li>
            )}
          </ul>
        </div>
        <div className="flex flex-col bg-[#1A1A1A] w-full">
          <div className="bg-[#212121] h-20 text-white font-bold text-4xl">
            Counter-Strike 2
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobbies;
