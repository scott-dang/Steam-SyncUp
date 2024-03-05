import React from "react"
import { defaultAvatarFull, User } from "../utilities"

/**
 * Function component for a lobby's header.
 * @param currentGame State prop for current game.
 * @param currentLobby State prop for current lobby.
 * @param getUser Gets the current user information.
 * @returns An area containing lobby information including 
 * a banner, current users, lobby name, and settings.
 */
export const LobbyHeader = ({ currentGame, currentLobby, getUser }) => {

	
    return (
        <div>
					<div
              className="flex items-center px-5 bg-graysecondary h-20 text-white font-bold text-4xl border border-graysecondary rounded-3xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://cdn.akamai.steamstatic.com/steam/apps/${currentGame.appid}/header.jpg)`,
                backgroundSize: "fit",
              }}
            >
              {currentGame && currentGame.name}
            </div>

            <div className="flex flex-row my-2 px-3 justify-between items-center">
              <div className="flex flex-row">
                {Object.values(currentLobby?.lobbyusers).map(
                  (user, avatarfull, index) => {
                    return (
                      <div className="flex flex-col items-center mx-2">
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
                            className="hover:scale-110 duration-300 max-w-full max-h-12 rounded-3xl"
                            alt="User profile"
                          />
                        </a>
                        {user.SteamUUID !== currentLobby.leader ? 
                        <button className="mt-2 text-sm border border-graysecondary w-full rounded-md hover:bg-white hover:text-black">
                          Kick
                        </button>
                        :
                        <></>}
                      </div>
                    )}
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
        </div>
    )
}