import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Game, Lobby } from "../utilities";

/**
 * Function component for a list of lobbies.
 * @param currentGame The current game selected by the client.
 * @param currentLobbyList The current list of public lobbies.
 * @param handleCreateLobby A handler callback function to create a lobby.
 * @param handleJoinLobby A handler callback function to join a lobby.
 * @param handleLeaveLobby A handler callback function to leave a lobby.
 * @param currentLobby The current lobby the user is in.
 * @returns A list of public lobbies given a specific game.
 */
export const LobbiesList = ({
  currentGame,
  currentLobbyList,
  handleMyLobby,
  handleJoinLobby,
  handleLeaveLobby,
  setModalState,
  currentLobby
}) => {
  const { getUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Lobby[]>([])

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [currentLobbyList]);

  const onSearchChange = (currentInput: string) => {

    setSearchInput(currentInput);
  
    if (currentInput.length > 0) {
      try {
        const searchResults: Lobby[] = currentLobbyList;
        setSearchResults(searchResults.filter(
          lobby => lobby.lobbyname.toLowerCase().startsWith(currentInput.toLowerCase())
        ));
      } catch (err) {
        setSearchResults([]);
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  }

  const onSearchResultMouseDown = (currentGame: Game, lobby: Lobby) => {
    // Close the dropdown when clicking on a game from the dropdown
    setSearchResults([]);
    if (!currentLobby) {
      handleJoinLobby(currentGame.appid, lobby.leader);
    } else if (currentLobby && currentLobby !== lobby) {
      handleLeaveLobby(currentLobby.appid, currentLobby.leader)
      setTimeout(() => {
        handleJoinLobby(currentGame.appid, lobby.leader)
        
      }, 500);
      
    }
  }

  const onSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = "Search for a lobby";

    // Reopen the dropdown with current input
    onSearchChange(e.target.value);
  }

  const onSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = "Search";

    // Close dropdown when clicking outside dropdown
    setSearchResults([]);
  }

  return (
    <div className="bg-grayprimary w-1/6 text-xl font-bold border border-graysecondary rounded-3xl">
      <h2 className="p-2 m-2 rounded-xl bg-graysecondary text-center">
        Lobbies
      </h2>
      
      <div className="flex items-center justify-center mb-2">
        <button 
          onClick={() => setModalState(true)}
          className="text-white text-xs bg-transparent border border-white hover:bg-white hover:text-black rounded-xl mx-2 py-2 text-center focus:outline-none w-full"
        >
          Create Lobby
        </button>
        
        <button
          className="text-white text-xs bg-transparent border border-white hover:bg-white hover:text-black rounded-xl mx-2 py-2 text-center focus:outline-none w-full"
          onClick={handleMyLobby}
        >
          My Lobby
        </button>
      </div>

      <form method="get" className="mx-2 py-1 text-sm">
          <input
            className="w-full text-white text-2l bg-transparent border border-white rounded-md text-center focus:outline-none"
            type="text"
            placeholder="Search"
            style={{ color: "white" }}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            value={searchInput}
          />
          <input type="submit" hidden/>
      </form>
      {searchResults.length > 0 && (
              // Searchbar dropdown
              <div className="absolute w-1/6 z-10 bg-graysecondary rounded-3xl shadow-lg overflow-y-scroll max-h-[30vh]">
                {searchResults.map((lobby: Lobby, index) => (
                  <div
                    key={index}
                    className="flex flex-row flex-wrap gap-x-2 px-4 py-2 text-white hover:bg-grayprimary cursor-pointer text-sm justify-between"
                    onMouseDown={() => onSearchResultMouseDown(currentGame, lobby)}
                  >
                    <p>{lobby.lobbyname}</p>
                    <p className="ml-2">{`${Object.keys(lobby.lobbyusers).length} / ${lobby.maxusers}`}</p>
                  </div>
                ))}
              </div>
            )}
      {/* Renders the lobbies list with a refresh indicator at the bottom when loading or not loading*/}
      <ul>
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
                  {lobby === currentLobby && (
                    <button
                    className="bg-transparent border border-white rounded-xl hover:bg-white hover:text-black px-4 py-1 text-center focus:outline-none ml-2"
                    onClick={() => {
                      handleLeaveLobby(currentGame.appid, lobby.leader);
                    }}
                  >
                    Leave
                  </button>
                  )}
                  <p className="ml-2">{`${Object.keys(lobby.lobbyusers).length} / ${lobby.maxusers}`}</p>
                </div>
              </div>
              <hr className="h-px my-4 bg-white border-0 dark:bg-gray-500" />
            </li>
          ))}
      </ul>
      {!loading ?
        (<div className="flex justify-center">
          <p className="text-center opacity-25 text-xs">Refreshes every 5 seconds</p>
        </div>) 
      :
        (<div role="status" className="flex items-center justify-center pt-5">
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
        )}
    </div>
  );
};
