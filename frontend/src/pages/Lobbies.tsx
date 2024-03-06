import "../App.css";
import Header from "../components/Header.tsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchUsersServiceAPI,
  Game,
  getCurrentLobby,
  Lobby,
  ReceivedMessage,
  SendMessage,
} from "../utilities";
import { useAuth } from "../context/AuthContext";
import useLobbySocket from "../hooks/useLobbySocket";
import { GamesList } from "../components/GamesList"
import { LobbiesList } from "../components/LobbiesList"
import { ChatArea, InputBox } from "../components/Chat.tsx"
import { LobbyHeader } from "../components/LobbyHeader.tsx"
import { AlertModal, Modal, NotificationModal } from "../components/Modal.tsx";

/**
 * This is the Lobbies page, where users can choose a game, lobby, and begin chatting with others.
 * @returns The Lobbies page, displaying the GamesList, LobbiesList, and Chat.
 */
export default function Lobbies({ game }) {
  const { getUser, getAuthToken } = useAuth();
  const [gameResults, setGameResults] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(game);
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [currentLobbyList, setCurrentLobbyList] = useState<Lobby[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [modalState, setModalState] = useState(false)

  const [notificationLeaveModalState, setNotificationLeaveModalState] = useState(false)

  const [currentLobbyNameInput, setCurrentLobbyNameInput] = useState<string>("");
  const handleCurrentLobbyNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLobbyNameInput(e.target.value);
  };

  const [currentLobbySizeInput, setCurrentLobbySizeInput] = useState<number>(1);
  const handleCurrentLobbySizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLobbySizeInput(e.target.valueAsNumber);
  };

  const user = getUser();

  const currentLobby = useMemo<Lobby | null>(() => {
    return getCurrentLobby(currentGame, currentLobbyList, getUser()) || null;
  }, [currentGame, currentLobbyList, getUser]);

  const { send, isOpen } = useLobbySocket(
    getUser().jwttoken,
    currentGame?.appid || 0,
    currentLobby?.leader || "",
    {
      addMessageToChat: (message: ReceivedMessage) => {
        addMessage(message);
      },
      clearChat: () => {
        setMessages([]);
      },
    },
  );

  // Fetches current users games and lobbies
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setGameResults(getUser().games);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGames();
  });

  // Updates the chat messages when new messages arrive.
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Sets the current game when game results are non-zero (first fetch).
  // Also fetches and sets the lobbies upon retrieval of game
  useEffect(() => {
    if (gameResults.length > 0 && !currentGame) {
      handleCurrentGame(gameResults[0]);
    }
  }, [gameResults]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentGame) {
      fetchLobbies(currentGame.appid);
    }
  }, [currentGame]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLobbies = async (gameId: number | null) => {
    if (gameId) {
      const url: string = `https://hj6obivy5m.execute-api.us-west-2.amazonaws.com/default/GetLobbies?${`game=${gameId}`}`;
      try {
        const response = await fetch(url, {
          headers: {
            authorization: "Bearer " + getAuthToken(),
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCurrentLobbyList(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOldMessages = (): string[] => {
    if (isOpen && currentGame && currentLobbyList && currentLobby) {
      return currentLobby.messages;
    }
    return [];
  };

  // Add new message to chat area.
  const addMessage = (message: ReceivedMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Handler for the text box input.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  // Handler to send messages using lobbySocket.
  const handleSendMessage = () => {
    // TODO: Add visual confirmation of message failure / success
    // (i.e., can fail if join lobby fails / web socket does not connect)
    if (isOpen) {
      const message: SendMessage = {
        action: "sendmessage",
        text: inputText,
        suid: getUser().uuid,
        personaname: getUser().personaname,
      };
      send(message);
    }
    setInputText("");
  };

  // Handler to create a new lobby, then fetch and update lobbies.
  const handleCreateLobby = async (gameId: number | null, currentLobbyName: string, maxusers: number) => {
    if (gameId === null) {
      console.error("gameId is null. Cannot create lobby.");
      return;
    }

    if (currentLobbyName === "") {
      console.error("currentLobbyName is empty. Cannot create lobby.");
      return;
    }

    if (maxusers < 1) {
      console.error("maxusers is invalid. Cannot create lobby.");
      return;
    }
    
    try {
      const createLobbyServiceEndpointURL: URL = new URL(`https://hj6obivy5m.execute-api.us-west-2.amazonaws.com/default/CreateLobby?game=${gameId.toString()}&name=${currentLobbyName}&maxusers=${maxusers}`)
      const resp = await fetch(createLobbyServiceEndpointURL, {

      headers: {
          "authorization": "Bearer " + getAuthToken(),
      }
      });

      // Refresh lobbies list upon success
      if (resp.ok) {
          await fetchLobbies(gameId)
      }
      
    } catch(err) {
        console.error(err)
    }
  };

  const handleMyLobby = async () => {
    const resp = await fetchUsersServiceAPI(user.jwttoken);

    if (resp?.lobbygame) {
      setCurrentGame(user.games.find(game => game.appid === Number(resp.lobbygame)) || currentGame || null)
    }
  }

  // Handler to set the current game when a different game is clicked.
  const handleCurrentGame = async (newGame: Game) => {
    setCurrentGame(newGame);
  };

  // Handler to join a lobby when a user chooses a game, and the lobby has a leader.
  const handleJoinLobby = async (
    gameId: number | null,
    lobbyLeader: string | null,
  ) => {
    if (gameId && lobbyLeader) {
      const url: string = `https://hj6obivy5m.execute-api.us-west-2.amazonaws.com/default/JoinLobby?game=${gameId.toString()}&leader=${lobbyLeader.toString()}`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (response.ok && currentGame) {
          await fetchLobbies(currentGame.appid);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handler to leave a lobby when a user chooses a game, and the lobby has a leader.
  const handleLeaveLobby = async (
    gameId: number | null,
    lobbyLeader: string | null,
  ) => {
    if (gameId && lobbyLeader) {
      const joinLobbyServiceEndpointURL: string = `https://hj6obivy5m.execute-api.us-west-2.amazonaws.com/default/LeaveLobby?game=${gameId.toString()}&leader=${lobbyLeader.toString()}`;
      try {
        const response = await fetch(joinLobbyServiceEndpointURL, {
          headers: {
            authorization: "Bearer " + getAuthToken(),
          },
        });

        if (response.ok && currentGame) {
          setNotificationLeaveModalState(true);
          setTimeout(() => {
            setNotificationLeaveModalState(false);
          }, 2000)
          await fetchLobbies(currentGame.appid);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* Header bar. */}
      <Header currentGame={currentGame} setCurrentGame={setCurrentGame} />

      {/* Content space. */}
      <div className="flex flex-row h-screen text-white">
        {/* Games list component. */}
        <GamesList
          gameResults={gameResults}
          handleCurrentGame={handleCurrentGame}
          currentGame={currentGame}
        />

        {/* Lobbies list component. */}
        <LobbiesList
          currentGame={currentGame}
          currentLobbyList={currentLobbyList}
          handleMyLobby={handleMyLobby}
          handleJoinLobby={handleJoinLobby}
          handleLeaveLobby={handleLeaveLobby}
          setModalState={setModalState}
        />

        {/* Chat area space containing the scrolling chat area, and input box. */}
        {currentGame && currentLobby && (
          <div className="flex flex-col flex-grow bg-grayprimary border border-graysecondary rounded-3xl w-fit">
            
            <LobbyHeader 
              currentGame={currentGame}
              currentLobby={currentLobby}
              fetchLobbies={fetchLobbies}        
              getAuthToken={getAuthToken}
            />

            <ChatArea
              messages={[...handleOldMessages(), ...messages].reverse()}
              chatRef={chatRef}
            />

            <InputBox
              inputText={inputText}
              handleInputChange={handleInputChange}
              handleSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>

      <Modal 
        onSave={() => handleCreateLobby(currentGame?.appid, currentLobbyNameInput, currentLobbySizeInput)}
        onCancel={() => {
          setCurrentLobbyNameInput("");
          setCurrentLobbySizeInput(1);
        }}
        modalState={modalState}
        setModalState={setModalState}
        modalContent={(
        <div className='flex flex-col justify-center'>
          <h1 className='mb-5 text-center text-xl'>
            <b>Create a lobby</b>
          </h1>
          <div className='flex flex-row'>
            <div className='flex flex-col'>
              <p className='my-3'>Lobby Name:</p>
              <p className='my-3 mt-4'>Max users:</p>
            </div>

            <div className='flex flex-col'>
              <input 
                className='bg-graysecondary my-2 rounded-md p-2 ml-5 focus:outline-none focus:ring-0 focus:border-gray-900'
                onChange={handleCurrentLobbyNameInput}
                >
                </input>
              <input 
                type="number"
                min="1"
                max="10"
                onChange={handleCurrentLobbySizeInput}
                className='bg-graysecondary rounded-md p-2 ml-5 focus:outline-none focus:ring-0 focus:border-gray-900'>
              </input>
            </div>
          </div>
        </div>
        )}        
      />

      {/* <AlertModal 
      modalState={modalState} 
      setModalState={setModalState} 
      cancelButtonRef={cancelButtonRef}
      modalHeader="Alert!"
      modalContent="This is an alert!"
      >
      </AlertModal> */}

      <NotificationModal 
        modalState={notificationLeaveModalState}
        setModalState={setNotificationLeaveModalState}
        cancelButtonRef={undefined}
        modalHeader={"Left"}
        modalContent={"You have left a lobby!"} 
      />
    </div>
  );
}
