import "../App.css";
import Header from "../components/Header";
import CreateLobbyForm from "../components/CreateLobbyForm";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultAvatarFull,
  fetchUsersServiceAPI,
  Game,
  getCurrentLobby,
  getDateString,
  getGameImageUrl,
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

/**
 * This is the Lobbies page, where users can choose a game, lobby, and begin chatting with others.
 * @returns The Lobbies page, displaying the GamesList, LobbiesList, and Chat.
 */
export default function Lobbies() {
  const { getUser, getAuthToken } = useAuth();
  const [gameResults, setGameResults] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [currentLobbyList, setCurrentLobbyList] = useState<Lobby[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [modalState, setModalState] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

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
    if (gameResults.length > 0) {
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
  const handleCreateLobby = async () => {
    setShowCreateForm(!showCreateForm);
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
          await fetchLobbies(currentGame.appid);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleModalStateOpen = () => setModalState(true);
  const handleModalStateClose = () => setModalState(false);

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
          handleCreateLobby={handleCreateLobby}
          handleMyLobby={handleMyLobby}
          handleJoinLobby={handleJoinLobby}
          handleLeaveLobby={handleLeaveLobby}
        />

        {/* Chat area space containing the scrolling chat area, and input box. */}
        {currentGame && currentLobby && (
          <div className="flex flex-col bg-grayprimary w-full border border-graysecondary rounded-3xl">
            
            <LobbyHeader 
              currentGame={currentGame} 
              currentLobby={currentLobby} 
              getUser={getUser}            
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

      {/* Handles Create Lobby Form. */}
      {showCreateForm && (
        <CreateLobbyForm
          onClose={handleCreateLobby}
          gameId={currentGame?.appid}
          fetchLobbies={fetchLobbies}
        />
      )}
    </div>
  );
}
