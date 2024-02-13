import '../App.css';
import Header from '../components/header';
import AllLobbies from '../components/lobbies.json'
import CreateLobbyForm from '../components/createlobbyform'
import React, {useEffect, useRef, useState } from 'react';
import { Game, getGameImageUrl} from '../utilities';
import { useAuth } from '../context/AuthContext';

interface Lobby {
  name: string,
  leader: string,
  users: string[]
  maxusers: number;
}

export default function Lobbies() {
  // State for the games sidebar
  const {getUser, getAuthToken, setupUser} = useAuth();
  const [gameResults, setGameResults] = useState<Game[]>([]);

  // Chat and game states
  const [currentGame, setCurrentGame] = useState<String>("");
  const [messages, setMessages] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState<string>("");

  const [currentLobby, setCurrentLobby] = useState<Lobby>();

  const [currentLobbyList, setCurrentLobbyList] = useState<Lobby[]>([]);

  // State for creating lobby 
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetches current users games and lobbies, updates if user changes 
  useEffect(() => {

    const fetchGames = async () => {
      try {
        setGameResults(getUser().games)
      } catch (err) {
        console.error(err);
      }
    };

    const fetchLobbies = async () => {
      const lobbiesServiceEndpointURL: URL = new URL("https://hj6obivy5m.execute-api.us-west-2.amazonaws.com/default/GetLobbies?game=400")
      try {

        console.log("Fetching lobbies")
        const resp = await fetch(lobbiesServiceEndpointURL, {
          headers: {
            "authorization": "Bearer " + getAuthToken(),
          }
        });
        
        const data = await resp.json();

        if (data) {

          const lobbies: Lobby[] = data.map((lobbyData: any) => {

            const lobby: Lobby = {
              name: lobbyData.lobbyname,
              leader: lobbyData.leader,
              users: lobbyData.lobbyusers,
              maxusers: lobbyData.maxusers
            }

            return lobby;
          });
          
          if (currentLobbyList) {
            
            setCurrentLobbyList(lobbies)
            setCurrentLobby(currentLobbyList[0])
            
          };

        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchGames();

    fetchLobbies();

  }, [getAuthToken, getUser, setupUser]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages])
 
  const addMessage = (message: string) => {
    setMessages(prevMessages => [message, ...prevMessages]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  const handleSendMessage = () => {
    addMessage("Me: " + inputText)
    setInputText("")
  }

  const handleCreateLobby = () => {
  setShowCreateForm(!showCreateForm);
  };

  const handleCurrentGame = (current: string) => {
    setCurrentGame(current)
  }

  return (
    <div className="overflow-hidden h-screen">

      {/* Header bar */}
      <Header></Header>

      {/* Content space */}
      <div className="flex flex-row h-screen text-white">

        {/* Games list component */}
        <GamesList gameResults={gameResults} handleCurrentGame={handleCurrentGame} />

        {/* Lobbies list component */}
        <LobbiesList currentLobbyList={currentLobbyList} handleCreateLobby={handleCreateLobby} />

        <div className="flex flex-col bg-[#1A1A1A] w-full">

          {/* Current seleceted game header */}
          <div className="bg-[#212121] h-20 text-white font-bold text-4xl">
            {currentGame}
          </div>

          {/* Scrolling chat area */}
          <ChatArea messages={messages} chatRef={chatRef} />

          {/* Input box */}
          <InputBox inputText={inputText} handleInputChange={handleInputChange} handleSendMessage={handleSendMessage} />
        </div>

      </div>

       {/* Handles Create Lobby Form*/}
       {showCreateForm && <CreateLobbyForm onClose={handleCreateLobby} />}
    </div>
  );
}

// Games list component
const GamesList: React.FC<{gameResults: Game[], handleCurrentGame: (current: string) => void }> = ({ gameResults, handleCurrentGame }) => {
  return (
    <div className="bg-[#4C4C4C] w-1/4 text-xl font-bold  overflow-y-auto"> 
      <p className="pt-2 text-center">
        Games
      </p>
      <hr className="h-px mb-8 mt-4 bg-white border-0 dark:bg-gray-500"/>
      <ul className=''>
        {gameResults && gameResults.map(game => 
          <li className='font-normal text-sm'>
            <button className='flex pl-2 items-center' onClick={() => handleCurrentGame(game.name)}>
              <img 
                className='w-10'
                src={getGameImageUrl(game.appid, game.img_icon_url)} 
                alt={"Thumbnail of " + game.name}>
              </img>
              <p className='ml-2'>{game.name}</p>
            </button>
            <hr className="h-px my-8 bg-white border-0 dark:bg-gray-500"/>
          </li>
        )}
      </ul>
    </div>
  )
};

// Lobbies list component
const LobbiesList: React.FC<{ currentLobbyList: Lobby[], handleCreateLobby: () => void }> = ({ currentLobbyList, handleCreateLobby }) => {
  return (
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

        {currentLobbyList.map(lobby => 
          <li className='font-normal text-sm'>
            <div className="flex mx-2 text-white text-xs items-center">
              <p>{lobby.name}</p>
              <button className='ml-auto pl-2'>
                <button className='bg-transparent border border-white rounded-full px-6 py-1 text-center focus:outline-none ml-2'>join</button>
              </button>
              <p className="ml-2">{lobby.users.length} / {lobby.maxusers}</p> 
            </div>
            <hr className="h-px my-4 bg-white border-0 dark:bg-gray-500"/>
          </li>
        )}
      </ul>
    </div>
  )
};

// Chat area component
const ChatArea: React.FC<{ messages: string[], chatRef: React.RefObject<HTMLDivElement> }> = ({ messages, chatRef }) => (
  <div ref={chatRef} className="overflow-y-auto p-4 flex flex-col-reverse h-screen" style={{ maxHeight: 'calc(90vh - 200px)' }}>
    {messages.map((message, index) => (
      <div key={index} className="mb-2">{message}</div>
    ))}
  </div>
);

// Input box component
const InputBox: React.FC<{
  inputText: string,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleSendMessage: () => void
}> = ({ inputText, handleInputChange, handleSendMessage }) => (
  <div className="flex p-4">
    <input 
      type="text" 
      placeholder="Type your message..." 
      value={inputText} 
      onChange={handleInputChange}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
      }}
      className="w-full rounded-2xl border-2 border-gray-500 p-2 bg-transparent"
    />
    <button className="bg-gray-700 text-white rounded-2xl px-4 py-2 ml-2" onClick={handleSendMessage}>Send</button>
  </div>
);