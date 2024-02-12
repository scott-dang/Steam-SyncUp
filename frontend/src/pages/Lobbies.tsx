import '../App.css';
import Header from '../components/header';
import AllLobbies from '../components/lobbies.json'
import CreateLobbyForm from '../components/createlobbyform'
import React, {useEffect, useState } from 'react';
import { fetchGamesServiceAPI, Game, GamesServiceResponse, getGameImageUrl} from '../utilities';
import { useAuth } from '../context/AuthContext';

export default function Lobbies() {
  // State for the games sidebar
  const {getUser, getAuthToken, setupUser} = useAuth();
  const [gameResults, setGameResults] = useState<Game[]>([]);

  // Fetches current users games, updates if user changes 
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesServiceData: GamesServiceResponse | null = await fetchGamesServiceAPI(getAuthToken());

        if (gamesServiceData !== null) {
          // Update games stored in the User
          setupUser(JSON.stringify({
            ...getUser(),
            games: gamesServiceData.list_of_games.games
          }));
        }

        const gameResults: Game[] = getUser().games;
        setGameResults(gameResults)
      } catch (err) {
        console.error(err);
      }
    };

    fetchGames(); 
  }, [getAuthToken, getUser, setupUser]);

   // State for creating lobby 
   const [showCreateForm, setShowCreateForm] = useState(false);

   const handleCreateLobby = () => {
    setShowCreateForm(!showCreateForm);
   };

  return (
    <div className="overflow-hidden h-screen">
      <Header></Header>
      <div className="flex flex-row h-screen text-white">
        <div className="bg-[#4C4C4C] w-1/4 text-xl font-bold  overflow-y-auto"> 
          <p className="pt-2 text-center">
            Games
          </p>
          <hr className="h-px mb-8 mt-4 bg-white border-0 dark:bg-gray-500"/>
          <ul className=''>
            {gameResults.map(game => 
              <li className='font-normal text-sm'>
                <a href='' className='flex pl-2'>
                  <img 
                    className='w-10'
                    src={getGameImageUrl(game.appid, game.img_icon_url)} 
                    alt={"Thumbnail of " + game.name}>
                  </img>
                  <button className='ml-2'>{game.name}</button>
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
            <ul className='my-4 flex items-center justify-center'>
              <button 
                className="text-white text-xs bg-transparent border border-white py-2 text-center focus:outline-none w-full" 
                onClick={handleCreateLobby}>
                Create Lobby
              </button>
              <button 
                className='text-white text-xs bg-transparent border border-white py-2 text-center focus:outline-none w-full'>
                My Lobby
              </button>
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
       {/* Handles Create Lobby Form*/}
       {showCreateForm && <CreateLobbyForm onClose={handleCreateLobby} />}
    </div>
  );
}
