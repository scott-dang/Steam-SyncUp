export interface User {
	uuid: string;
	authenticated: boolean;
	jwttoken: string;
	games: Game[];
	personaname: string;
	avatarfull: string;
}

export interface GamesServiceResponse {
	authenticated: boolean;
	uuid: string;
	list_of_games: ListOfGames;
}

export interface AuthServiceResponse {
	is_valid: boolean;
	jwttoken: string;
}

export interface UsersServiceResponse {
	avatarfull: string;
	personaname: string;
}

export interface ListOfGames {
	game_count: number;
	games: Game[];
}

export interface Game {
	appid: number;
	name: string;
	img_icon_url: string;
}

export const isLocalHost = (): boolean => {
	return (
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1" ||
		window.location.hostname === ""
	);
};

export const getBaseUrl = (): string => {
	const urlOrigin: string = window.location.origin;
	return urlOrigin;
};

export const getGameImageUrl = (appid: number, hash: string): string => {
	return (
		"http://media.steampowered.com/steamcommunity/public/images/apps/" +
		appid +
		"/" +
		hash +
		".jpg"
	);
};

export const fetchGamesServiceAPI = async (
	authToken: string
): Promise<GamesServiceResponse | null> => {
	try {
		const resp = await fetch(gamesServiceEndpointURL, {
			headers: {
				authorization: "Bearer " + authToken,
			},
		});

		const data = await resp.json();

		if (data.authenticated === true) {
			const gamesServiceResponse: GamesServiceResponse = data;

			return gamesServiceResponse;
		}
	} catch (err) {
		console.error(err);
	}

	return null;
};

export const fetchUsersServiceAPI = async (
	authToken: string,
	uuid?: string
): Promise<UsersServiceResponse | null> => {
	try {
		const url = uuid
			? `${usersServiceEndpointURL}?uuid=${uuid}`
			: usersServiceEndpointURL;
		const resp = await fetch(url, {
			headers: {
				authorization: "Bearer " + authToken,
			},
		});

		const data = await resp.json();

		if (data?.personaname) {
			const usersServiceResponse: UsersServiceResponse = data;
			return usersServiceResponse;
		}
	} catch (err) {
		console.error(err);
	}

	return null;
};

export const steamOpenIdEndpointUrl = (): URL => {
	const url: URL = new URL("https://steamcommunity.com/openid/login");
	url.search = new URLSearchParams({
		"openid.ns": "http://specs.openid.net/auth/2.0",
		"openid.claimed_id":
			"http://specs.openid.net/auth/2.0/identifier_select",
		"openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
		"openid.return_to": getBaseUrl() + "/auth",
		"openid.realm": getBaseUrl() + "/auth",
		"openid.mode": "checkid_setup",
	}).toString();

	return url;
};

/**
 * Searches through all the lobbies of the current game and determines
 * whether or not there exists a lobby that the user is in already
 * @returns Lobby iff there exists a lobby the user is in, else undefined
 */
export const getCurrentLobby = (currentGame: Game | null, currentLobbyList: Lobby[], currentUser: User): Lobby | undefined => {
  if (currentGame) {
    const result = currentLobbyList.find(lobby => {

      const sameGame = lobby.appid === currentGame.appid;
      const hasUser = lobby.lobbyusers.includes(currentUser.uuid);

      return sameGame && hasUser;
    });

    return result;
  }
  return undefined;
}

export interface Lobby {
  name: string,
  leader: string,
  maxusers: number,
  lobbyname: string,
  lobbyusers: string[],
  appid: number,
  messages: string[],
}

export interface Message {
  action:       string,
  text:         string,
  suid:         string,
  personaname:  string,
}

export const authServiceEndpointURL: URL = new URL(
	"https://og8ukicoij.execute-api.us-west-2.amazonaws.com/default/auth"
);

export const gamesServiceEndpointURL: URL = new URL(
	"https://zffdaxx75j.execute-api.us-west-2.amazonaws.com/default/GamesService"
);

export const usersServiceEndpointURL: URL = new URL(
	"https://1teuwfqobe.execute-api.us-west-2.amazonaws.com/default/UsersService"
);
