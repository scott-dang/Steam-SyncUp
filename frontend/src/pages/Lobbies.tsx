import '../App.css';
import Header from '../components/header';
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

let lobbySocket: WebSocket;

export default function Lobbies() {
  // State for the games sidebar
  const {getUser, getAuthToken, setupUser} = useAuth();
  const [gameResults, setGameResults] = useState<Game[]>([]);

  // Chat and game states
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState<string>("");

  const [currentLobbyList, setCurrentLobbyList] = useState<Lobby[]>([]);

  // State for creating lobby 
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchLobbies = async (gameId: number | null) => {
    const lobbiesServiceEndpointURL: URL = new URL("https://hj6obivy5m.execute-api.us-west-2.amazonaws.com/default/GetLobbies?")
    
    if (gameId) {
      lobbiesServiceEndpointURL.searchParams.set("game", gameId.toString())
    }

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

          // TODO:
          // setCurrentLobby(currentLobbyList[0])
        };
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    if (!lobbySocket) {
      lobbySocket = new WebSocket("wss://uvchtgqo14.execute-api.us-west-2.amazonaws.com/production/?jwttoken=" + getAuthToken());
    }

    lobbySocket.onmessage = (ev: MessageEvent<any>) => {
      try {
        const data = JSON.parse(ev.data);

        if (data.suid && data.message && data.date) {
          addMessage(data.suid + ": " + data.message);
        }

      } catch (err) {
        console.error(err);
      }
    }

    lobbySocket.onclose = (ev: CloseEvent) => {
      console.log("Closing lobbySocket due to " + ev.reason);
    }

    lobbySocket.onopen = () => {
      console.log("Opening lobbySocket");
    }
  })

  // Fetches current users games and lobbies, updates if user changes 

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setGameResults(getUser().games)
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchGames();
  }, [getAuthToken, getUser, setupUser, showCreateForm]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (gameResults.length > 0) {
      setCurrentGame(gameResults[0]); // Set currentGame to the first element of gameResults
    }
  }, [gameResults]);
 
  const addMessage = (message: string) => {
    setMessages(prevMessages => [message, ...prevMessages]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  };

  const handleSendMessage = () => {
    lobbySocket.send(JSON.stringify({
      action: "sendmessage",
      message: inputText,
      suid: getUser().uuid,
    }))
    addMessage("Me: " + inputText)
    setInputText("")
  };

  const handleCreateLobby = async () => {
    setShowCreateForm(!showCreateForm);

    if (currentGame?.appid) {
      await fetchLobbies(currentGame.appid)
    }
  };

  const handleCurrentGame = async (currentGame: Game) => {
    setCurrentGame(currentGame)
    await fetchLobbies(currentGame.appid)
  };

  return (
    <div className="overflow-hidden h-screen">

      {/* Header bar */}
      <Header></Header>

      {/* Content space */}
      <div className="flex flex-row h-screen text-white">

        {/* Games list component */}
        <GamesList gameResults={gameResults} handleCurrentGame={handleCurrentGame} />

        {/* Lobbies list component */}
        <LobbiesList currentLobbyList={currentLobbyList} showCreateForm={showCreateForm} handleCreateLobby={handleCreateLobby} />

        <div className="flex flex-col bg-grayprimary w-full border border-graysecondary rounded-3xl">
          {/* Current seleceted game header */}
          {currentGame &&
          <div className="flex items-center px-5 bg-graysecondary h-20 text-white font-bold text-4xl border border-graysecondary rounded-3xl"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://cdn.akamai.steamstatic.com/steam/apps/${currentGame.appid}/header.jpg)`,
            backgroundSize: "fit",
          }}>
            {currentGame && currentGame.name}
          </div>
          }

          {/* Scrolling chat area */}
          <ChatArea messages={messages} chatRef={chatRef} />

          {/* Input box */}
          <InputBox inputText={inputText} handleInputChange={handleInputChange} handleSendMessage={handleSendMessage} />
        </div>

      </div>

       {/* Handles Create Lobby Form*/}
       {showCreateForm && <CreateLobbyForm onClose={handleCreateLobby} gameId={currentGame?.appid} />}
    </div>
  );
}

// Games list component
const GamesList: React.FC<{gameResults: Game[], handleCurrentGame: (currentGame: Game) => void }> = ({ gameResults, handleCurrentGame }) => {
  const [clicked, setClicked] = useState<number | null>(0); // Track the clicked element index

  return (
    <div className="bg-grayprimary w-1/4 text-xl font-bold overflow-y-auto border border-graysecondary rounded-3xl"> 
      <p className="p-2 text-center text-white bg-graysecondary rounded-xl m-2 drop-shad-xl">
        Games
      </p>
      <ul className='pt-5'>
        {gameResults && gameResults.map((game, index) => 
          <li 
            key={game.appid} 
            className='font-normal rounded-xl mb-5 mx-2' 
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg)`,
              backgroundSize: "cover",
              backdropFilter: "blur(5px)",
              transition: "transform 0.1s ease, box-shadow 0.3s ease",
              boxShadow: index === clicked ? "0 0 1px 1px white inset" : "none",
            }}
            onClick={() => {
              handleCurrentGame(game);
              setClicked(index);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 8px 4px white inset";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = index === clicked ? "0 0 1px 1px white inset" : "none";
            }}
          >
            <div className='flex flex-row items-center p-2'>
              <img 
                  className='w-10 rounded-md'
                  src={getGameImageUrl(game.appid, game.img_icon_url)} 
                  alt={"Thumbnail of " + game.name}
              />
              <p className='text-white text-sm font-bold'>{game.name}</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};


// Lobbies list component
const LobbiesList: React.FC<{ currentLobbyList: Lobby[], showCreateForm: boolean, handleCreateLobby: () => void }> = ({ currentLobbyList, showCreateForm, handleCreateLobby }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [currentLobbyList]);

  return (
    <div className="bg-grayprimary w-1/4 text-xl font-bold border border-graysecondary rounded-3xl"> 
      <p className="p-2 m-2 rounded-xl bg-graysecondary text-center">
        Lobbies
      </p>

      <ul className='flex items-center justify-center'>
          <button 
            className="text-white text-xs bg-transparent border border-white hover:bg-white hover:text-black rounded-xl mx-2 py-2 text-center focus:outline-none w-full" 
            onClick={handleCreateLobby}>
            Create Lobby
          </button>
          <button 
            className='text-white text-xs bg-transparent border border-white hover:bg-white hover:text-black rounded-xl mx-2 py-2 text-center focus:outline-none w-full'>
            My Lobby
          </button>
        </ul>
      {loading ? 
        (<div role="status" className='flex items-center justify-center pt-5'>
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-grayprimary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>) : 
        (<ul className='py-2'>
          {currentLobbyList.map(lobby => 
            <li className='font-normal text-sm my-5'>
              <div className="flex mx-2 text-white text-xs items-center">
                <p>{lobby.name}</p>
                <button className='ml-auto pl-2'>
                  <button className='bg-transparent border border-white rounded-xl hover:bg-white hover:text-black px-6 py-1 text-center focus:outline-none ml-2'>join</button>
                </button>
                <p className="ml-2">{lobby.users.length} / {lobby.maxusers}</p> 
              </div>
              <hr className="h-px my-4 bg-white border-0 dark:bg-gray-500"/>
            </li>
          )}
        </ul>)
      }
    </div>
  );
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
    <button className="bg-gray-700 text-white rounded-2xl px-4 py-2 ml-2 hover:bg-white hover:text-black" onClick={handleSendMessage}>Send</button>
  </div>
);
