import "../App.css";
import Header from "../components/header";
import CreateLobbyForm from "../components/createlobbyform";
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
import { Modal } from "@mantine/core"

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
            <div
              className="flex items-center px-5 bg-graysecondary h-20 text-white font-bold text-4xl border border-graysecondary rounded-3xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://cdn.akamai.steamstatic.com/steam/apps/${currentGame.appid}/header.jpg)`,
                backgroundSize: "fit",
              }}
            >
              {currentGame && currentGame.name}
            </div>

            <div className="flex flex-row my-2 mx-5 px-3 justify-between items-center">
              <div className="flex flex-row ">
                {Object.values(currentLobby?.lobbyusers).map(
                  (user, avatarfull, index) => (
                    <a
                      href={`https://steamcommunity.com/profiles/${user}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={
                          user.uuid === getUser().uuid
                            ? getUser().avatarfull
                            : user.avatarfull || defaultAvatarFull
                        }
                        className="hover:scale-125 duration-300 max-w-full max-h-12 rounded-3xl"
                        alt="User profile"
                      />
                    </a>
                  ),
                )}
              </div>

              <div>{currentLobby.lobbyname}</div>

              {currentLobby.leader === getUser().personaname ? (
                <button>
                  Lobby Settings
                </button>
              ) : (
                <button>
                  Settings
                </button>
              )}
            </div>

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

      <Modal opened={modalOpen} onClose={handleCloseModal} title="Settings modal">
                  {/* Modal content */}
                  <div>
                    Settings modal
                  </div>
      </Modal>

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

/**
 * A function component for a list of games.
 * @param gameResults A list of games owned by the user.
 * @param handleCurrentGame A handler callback function to update the current game.
 * @returns A visual list of games owned by the user.
 */
const GamesList = ({ gameResults, currentGame, handleCurrentGame }) => {
  const isCurrentGame = (appid: number) => {
    if (currentGame && appid && currentGame.appid) {
      return appid === currentGame.appid;
    }
    return false;
  };

  return (
    <div className="bg-grayprimary w-1/4 text-xl font-bold overflow-y-auto border border-graysecondary rounded-3xl">
      <h2 className="p-2 text-center text-white bg-graysecondary rounded-xl m-2 drop-shad-xl">
        Games
      </h2>
      <ul className="list-none py-4">
        {gameResults &&
          gameResults.map((game: Game) => (
            <li
              key={game.appid}
              className="font-normal rounded-xl mb-5 mx-2"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg)`,
                backgroundSize: "cover",
                backdropFilter: "blur(5px)",
                transition: "transform 0.1s ease, box-shadow 0.3s ease",
                boxShadow: isCurrentGame(game.appid)
                  ? "0 0 1px 1px white inset"
                  : "none",
              }}
              onClick={() => {
                handleCurrentGame(game);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 2px 2px white inset";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = isCurrentGame(game.appid)
                  ? "0 0 1px 1px white inset"
                  : "none";
              }}
            >
              <div className="flex flex-row items-center p-2">
                <img
                  className="w-10 rounded-md"
                  src={getGameImageUrl(game.appid, game.img_icon_url)}
                  alt={"Thumbnail of " + game.name}
                />
                <p className="text-white text-sm font-bold">{game.name}</p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

/**
 * Function component for a list of lobbies.
 * @param currentGame The current game selected by the client.
 * @param currentLobbyList The current list of public lobbies.
 * @param handleCreateLobby A handler callback function to create a lobby.
 * @param handleJoinLobby A handler callback function to join a lobby.
 * @param handleLeaveLobby A handler callback function to leave a lobby.
 * @returns A list of public lobbies given a specific game.
 */
const LobbiesList = ({
  currentGame,
  currentLobbyList,
  handleCreateLobby,
  handleMyLobby,
  handleJoinLobby,
  handleLeaveLobby,
}) => {
  const { getUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [currentLobbyList]);

  return (
    <div className="bg-grayprimary w-1/4 text-xl font-bold border border-graysecondary rounded-3xl">
      <h2 className="p-2 m-2 rounded-xl bg-graysecondary text-center">
        Lobbies
      </h2>

      <div className="flex items-center justify-center">
        <button
          className="text-white text-xs bg-transparent border border-white hover:bg-white hover:text-black rounded-xl mx-2 py-2 text-center focus:outline-none w-full"
          onClick={handleCreateLobby}
        >
          Create Lobby
        </button>
        <button className="text-white text-xs bg-transparent border border-white hover:bg-white hover:text-black rounded-xl mx-2 py-2 text-center focus:outline-none w-full"
        onClick={handleMyLobby}
        >
          My Lobby
        </button>
      </div>

      {/* Render either loading or lobbies list */}
      {loading ? (
        <div role="status" className="flex items-center justify-center pt-5">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-grayprimary"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <ul className="py-2">
          {currentLobbyList.map((lobby: Lobby, index: number) => (
            <li className="font-normal text-sm my-5" key={index}>
              <div className="flex justify-between mx-2 text-white text-xs items-center">
                <p>{lobby.lobbyname}</p>
                <div className="flex flex-row items-center">
                  {!(getUser().uuid in lobby.lobbyusers) && (
                    <button
                      className="bg-transparent border border-white rounded-xl hover:bg-white hover:text-black px-4 py-1 text-center focus:outline-none ml-2"
                      onClick={() => {
                        handleJoinLobby(currentGame.appid, lobby.leader);
                      }}
                    >
                      Join
                    </button>
                  )}
                  <button
                    className="bg-transparent border border-white rounded-xl hover:bg-white hover:text-black px-4 py-1 text-center focus:outline-none ml-2"
                    onClick={() => {
                      handleLeaveLobby(currentGame.appid, lobby.leader);
                    }}
                  >
                    Leave
                  </button>
                  <p className="ml-2">{`${Object.keys(lobby.lobbyusers).length} / ${lobby.maxusers}`}</p>
                </div>
              </div>
              <hr className="h-px my-4 bg-white border-0 dark:bg-gray-500" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Function component for a chat area.
 * @param messages A list of messages.
 * @param chatRef A chat persistence reference.
 * @returns An area where chat messages are displayed.
 */
const ChatArea = ({ messages, chatRef }) => {
  const { getUser } = useAuth();

  return (
    <div
      ref={chatRef}
      className="flex flex-col-reverse p-4 overflow-y-auto h-screen"
      style={{ maxHeight: "calc(85vh - 200px)" }}
    >
      {messages.map((message: ReceivedMessage, index: number) => (
        <div key={index} className="flex-col my-2">
          <div className="flex flex-row items-baseline px-3 py-1">
            <div className="">
              <a
                href={`https://steamcommunity.com/profiles/${message.suid}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={
                    message.suid === getUser().uuid
                      ? getUser().avatarfull
                      : message.avatarfull || defaultAvatarFull
                  }
                  className="max-w-full max-h-6"
                  alt="User profile"
                />
              </a>
            </div>
            <div className="ml-1">
              <a
                href={`https://steamcommunity.com/profiles/${message.suid}`}
                target="_blank"
                rel="noreferrer"
              >
                {message.personaname}
              </a>
            </div>
            <div className="ml-3 text-sm">
              {getDateString(new Date(+message.timestamp))}
            </div>
          </div>
          <div className="bg-graysecondary px-3 py-2 rounded-3xl text-sm">
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Function component for an input box.
 * @param inputText A prop to display the current state of the input text.
 * @param handleInputChange A handler to update the input text.
 * @param handleSendMessage A handler to send the inputText.
 * @returns An area where chat messages can be input.
 */
const InputBox = ({ inputText, handleInputChange, handleSendMessage }) => (
  <div className="fixed bottom-0 p-4 w-full">
    <div className="flex">
      <input
        type="text"
        placeholder="Type your message..."
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSendMessage();
          }
        }}
        className="w-1/2 rounded-2xl border-2 border-gray-500 p-2 bg-transparent text-white"
      />
      <button
        className="bg-gray-700 text-white rounded-2xl px-4 py-2 ml-2 hover:bg-white hover:text-black"
        onClick={handleSendMessage}
      >
        Send
      </button>
    </div>
  </div>
);
