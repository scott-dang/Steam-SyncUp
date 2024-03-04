import '../App.css';
import SteamButton from './steam_button.png'
import { Link, useLocation } from 'react-router-dom';
import React, { FocusEvent, FormEvent, useState } from 'react';
import { fetchGamesServiceAPI, Game, GamesServiceResponse, getGameImageUrl, steamOpenIdEndpointUrl } from '../utilities';
import { useAuth } from '../context/AuthContext';

export default function Header({currentGame, setCurrentGame}) {

  const { getUser, getAuthToken, isLoggedIn, setupUser, logout } = useAuth();

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);

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

    setCurrentGame(game);
  }

  return (
    <div className="flex flex-row py-8 px-10 justify-between items-center bg-grayprimary">
      <Link className="text-white text-4xl cursor-pointer hover:scale-110 duration-150" to="/">
        <b>
          <em>
            Steam SyncUp
          </em>
        </b>
      </Link>

      {(location.pathname !== "/lobbies" && isLoggedIn()) &&
        // Lobbies button
        <Link className="text-white text-2xl cursor-pointer hover:scale-110 duration-150" to="/lobbies">
          <b>
            <em>
              Lobbies
            </em>
          </b>
        </Link>
      }

      {(location.pathname === "/lobbies" && isLoggedIn()) &&
        // Searchbar
        <div className="flex flex-initial flex-row justify-items-start relative w-2/5">
          <div className="w-full">

            {(location.pathname === "/lobbies" && currentGame) ?
              // Replace searchbar input with selected game
              <div
                className="flex flex-row items-center justify-center cursor-pointer w-full hover:scale-110 duration-150"
                onClick={() => setCurrentGame(null)}
                title={"Remove " + currentGame.name}
              >
                <img
                  className="h-12 w-12 cursor-pointer rounded-md"
                  src={getGameImageUrl(currentGame.appid, currentGame.img_icon_url)}
                  alt={"Thumbnail of " + currentGame.name}
                />
                <span className="text-3xl text-white text-nowrap truncate ml-5">
                 <b>
                  <em>
                  {currentGame.name}
                  </em>
                 </b>
                </span>
              </div>
              :
              // No game is selected; show searchbar text input
              <form method="get" onSubmit={onSearchSubmit} className="w-full">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full text-white text-2l bg-transparent border border-white rounded-xl px-6 py-2 text-center focus:outline-none"
                  style={{ color: "white" }}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  value={searchInput}
                />
                <input type="submit" hidden/>
              </form>
            }

            {searchResults.length > 0 && (
              // Searchbar dropdown
              <div className="absolute z-10 w-full bg-graysecondary rounded-3xl shadow-lg overflow-y-scroll max-h-[30vh]">

                {searchResults.map((game: Game, index) => (
                  <div
                    key={index}
                    className="flex flex-row flex-wrap gap-x-2 px-4 py-2 text-white hover:bg-grayprimary cursor-pointer"
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
        <Link className="text-white text-2xl ml-10  hover:scale-110 duration-150" to="/settings">
          <b>
            <em>
              Settings
            </em>
          </b>
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
        <Link onClick={logout} className="text-white text-2xl cursor-pointer hover:scale-110 duration-150" to="/">
          <b>
            <em>
              Sign Out
            </em>
          </b>
        </Link>
      }
    </div>
  );
}
