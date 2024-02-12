import '../App.css';
import SteamButton from './steam_button.png'
import { Link, useLocation } from 'react-router-dom';
import React, { FocusEvent, FormEvent, useState } from 'react';
import { fetchGamesServiceAPI, Game, GamesServiceResponse, getGameImageUrl, steamOpenIdEndpointUrl } from '../utilities';
import { useAuth } from '../context/AuthContext';

export default function Header() {

  const { getUser, getAuthToken, isLoggedIn, setupUser, logout } = useAuth();

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedResult, setSelectedResult] = useState<Game | null>(null);

  // Used to determine the route we are on and conditionally load certain features (i.e., search bar)
  const location = useLocation();

  // Runs when user clicks enter; refreshes list of games they own
  const onSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    try {

      const gamesServiceData: GamesServiceResponse | null = await fetchGamesServiceAPI(getAuthToken());

      if (gamesServiceData !== null) {

        // Update games stored in the User
        setupUser(JSON.stringify({
          ...getUser(),
          games: gamesServiceData.list_of_games.games
        }));

        onSearchChange(searchInput);
      }

    } catch (err) {
      console.error(err);
    }
  }

  const onSearchChange = (currentInput: string) => {

    setSearchInput(currentInput);
  
    if (currentInput.length > 0) {

      try {

        const searchResults: Game[] = getUser().games;

        setSearchResults(searchResults.filter(
          game => game.name.toLowerCase().startsWith(currentInput.toLowerCase())
        ));

      } catch (err) {
        setSearchResults([]);
        console.error(err);
      }
    } else {

      setSearchResults([]);

    }
  }

  const onSearchFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = "Press ENTER to refresh the list";

    // Reopen the dropdown with current input
    onSearchChange(e.target.value);
  }

  const onSearchBlur = (e: FocusEvent<HTMLInputElement>) => {
    e.target.placeholder = "Search";

    // Close dropdown when clicking outside dropdown
    setSearchResults([]);
  }

  const onSearchResultMouseDown = (game: Game) => {
    // Close the dropdown when clicking on a game from the dropdown
    setSearchResults([]);

    setSelectedResult(game);
  }

  return (
    <div className="flex justify-between items-center pt-10 px-10 pb-10 bg-[#222222]">
      <Link className="text-white text-3xl cursor-pointer" to="/">
        Steam SyncUp
      </Link>

      {(location.pathname !== "/lobbies" && isLoggedIn()) &&
        // Lobbies button
        <Link className="text-white text-2xl cursor-pointer" to="/lobbies">
          Lobbies
        </Link>
      }

      {(location.pathname === "/lobbies" && selectedResult) &&
        // Show selectedResult next to searchbar
        <div
          className="flex flex-row items-center cursor-pointer" onClick={() => setSelectedResult(null)}
          title={"Remove " + selectedResult.name}
        >
          <img
            className="h-12 w-12 cursor-pointer"
            src={getGameImageUrl(selectedResult.appid, selectedResult.img_icon_url)}
            alt={"Thumbnail of " + selectedResult.name}
          />
          <span className="text-white max-w-100 text-nowrap truncate ml-5">
           {selectedResult.name}
          </span>
        </div>}

      {(location.pathname === "/lobbies" && isLoggedIn()) &&
        // Searchbar
        <div className="flex flex-initial flex-row justify-items-start relative w-2/5">
          <div className="ml-10 w-full">
            <form method="get" onSubmit={onSearchSubmit} className="w-full">
              <input
                type="text"
                placeholder="Search"
                className="w-full text-white text-2l bg-transparent border border-white rounded-xl px-6 py-2 text-center focus:outline-none"
                style={{ color: "white" }} // Adjust width
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                value={searchInput}
              />
              <input type="submit" hidden/>
            </form>

            {searchResults.length > 0 && (
              // Searchbar dropdown
              <div className="absolute z-10 w-full bg-white rounded-md shadow-lg">

                {searchResults.slice(0,7) // Show max 7 games for the dropdown
                              .map((game: Game, index) => (
                  <div
                    key={index}
                    className="flex flex-row flex-wrap gap-x-2 px-4 py-2 text-black hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => onSearchResultMouseDown(game)}
                  >
                    <img
                      className="flex-none"
                      alt={"Thumbnail of " + game.name}
                      src={getGameImageUrl(game.appid, game.img_icon_url)}
                    />
                    <div>
                      {game.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      }

      {isLoggedIn() &&
        // Settings button
        <Link className="text-white text-2xl ml-10" to="/settings">
          Settings
        </Link>
      }

      {!isLoggedIn() &&
        // Steam button
        <a href={steamOpenIdEndpointUrl().toString()} target="_self" rel="noreferrer">
          <img src={SteamButton} alt={""}></img>
        </a>
      }

      {isLoggedIn() &&
        // Signout button
        <Link onClick={logout} className="text-white text-2xl cursor-pointer" to="/">
          Sign out
        </Link>
      }
    </div>
  );
}
