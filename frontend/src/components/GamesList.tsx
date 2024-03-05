import React from "react";
import { Game, getGameImageUrl } from "../utilities";

/**
 * A function component for a list of games.
 * @param gameResults A list of games owned by the user.
 * @param handleCurrentGame A handler callback function to update the current game.
 * @returns A visual list of games owned by the user.
 */
export const GamesList = ({ gameResults, currentGame, handleCurrentGame }) => {
  const isCurrentGame = (appid: number) => {
    if (currentGame && appid && currentGame.appid) {
      return appid === currentGame.appid;
    }
    return false;
  };

  return (
    <div className="bg-grayprimary w-1/6 text-xl font-bold overflow-y-auto border border-graysecondary rounded-3xl">
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
