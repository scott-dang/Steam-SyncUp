import '../App.css';
import SteamButton from './steam_button.png'
import { Link, useLocation } from 'react-router-dom';
import React, { FormEvent, useState } from 'react';
import { fetchUserOwnedGames, Game, steamOpenIdEndpointUrl } from '../utilities';

export default function Header() {

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);

  // Used to determine the route we are on and conditionally load certain features (i.e., search bar)
  const location = useLocation();

  const onSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    try {

      const games: Game[] = await fetchUserOwnedGames();

      localStorage.setItem("games", JSON.stringify(games));

      onSearchChange(searchInput);

    } catch (err) {
      console.error(err);
    }
  }

  const onSearchChange = (currentInput: string) => {

    setSearchInput(currentInput);
  
    const searchResultsStr: string = localStorage.getItem("games") || "[]";

    if (currentInput.length > 0 && searchResultsStr !== null) {

      try {

        const searchResults: Game[] = JSON.parse(searchResultsStr) || [];

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

  return (
    <div className="flex justify-between items-center pt-10 px-10 pb-10 bg-[#222222]">
      <Link className="text-white text-3xl cursor-pointer" to="/">
        Steam SyncUp
      </Link>
      <Link className="text-white text-2xl cursor-pointer" to="/lobbies">
        Lobbies
      </Link>
      {location.pathname === "/lobbies" && 
        <div className="relative ml-10 w-2/5">
          <form method="get" onSubmit={onSearchSubmit} className="w-full">
            <input
              type="text"
              placeholder="Search"
              className="w-full text-white text-2l bg-transparent border border-white rounded-xl px-6 py-2 text-center focus:outline-none"
              style={{ color: "white" }} // Adjust width
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={(e) => {
                e.target.placeholder = "Press ENTER to refresh the list";
                // Reopen the dropdown with current input
                onSearchChange(e.target.value);
              }}
              onBlur={(e) => {
                e.target.placeholder = "Search";
                // Close the dropdown
                setSearchResults([]);
              }}
              value={searchInput}
            />
            <input type="submit" hidden/>
          </form>

          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white rounded-md shadow-lg">

              {searchResults.slice(0,7) // Show max 7 games for the dropdown
                            .map((game: Game, index) => (
                <div
                  key={index}
                  className="flex flex-row flex-wrap gap-x-2 px-4 py-2 text-black hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    // Close the dropdown when clicking on a game from the dropdown
                    setSearchResults([]);
                  }}
                >
                  <img className="flex-none" alt={"Thumbnail of " + game.name} src={"http://media.steampowered.com/steamcommunity/public/images/apps/" + game.appid + "/" + game.img_icon_url + ".jpg"}/>
                  <div>
                    {game.name}
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      }
      <Link className="text-white text-2xl ml-10" to="/settings">
        Settings
      </Link>

      <a href={steamOpenIdEndpointUrl().toString()} target="_self" rel="noreferrer">
        <img src={SteamButton} alt={""}></img>
      </a>
    </div>
  );
}
