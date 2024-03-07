export interface User {
	uuid: string;
	authenticated: boolean;
	jwttoken: string;
	games: Game[];
	personaname: string;
	avatarfull: string;
  lobbygame: string;
  lobbyleader: string;
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
  lobbygame: string;
  lobbyleader: string;
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
      const hasUser = currentUser.uuid in lobby.lobbyusers;

      return sameGame && hasUser;
    });

    return result;
  }
  return undefined;
}

export const mergeFullMessageHistory = (messages: ReceivedMessage[]): ReceivedMessage[] => { 
  let newMessages: ReceivedMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    newMessages = mergeIncomingMessage(newMessages, messages[i]);
  }
  return newMessages;
}

export const mergeIncomingMessage = (messages: ReceivedMessage[], newMessage: ReceivedMessage): ReceivedMessage[] => {
  const newMessageHistory: ReceivedMessage[] = messages;
  const prevMessage = messages.at(-1);

  if (prevMessage && prevMessage.suid === newMessage.suid) {
    const prevMessageDate = new Date(prevMessage.mergetimestamp || +prevMessage.timestamp);
    const newMessageDate = new Date(newMessage.mergetimestamp || +newMessage.timestamp);
    if (getMinDiffInDates(newMessageDate, prevMessageDate) <= 5) {
      const newMessageCpy: ReceivedMessage = {
        ...prevMessage, 
        mergetimestamp: +newMessage.timestamp,
        text: prevMessage.text + "\n" + newMessage.text,
      };

      if (newMessageHistory.length > 0) {
        newMessageHistory[newMessageHistory.length - 1] = newMessageCpy;
        return newMessageHistory;
      }
    }
  }
  newMessageHistory.push({...newMessage});
  return newMessageHistory;
}

const getMinDiffInDates = (a: Date, b: Date) => {
  return Math.floor(Math.abs(a.getTime() - b.getTime())/(1000*60));
}

export const getDateString = (date: Date): string => {
  const timeString = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "numeric",
  });
  const dateString = date.toLocaleDateString([], {});

  if (date.getDay() === new Date().getDay()) {
    return `Today at ${timeString}`;
  } else if (date.getDay() === new Date().getDay() - 1) {
    return `Yesterday at ${timeString}`;
  }
  return `${dateString} ${timeString}`;
}

export interface Lobby {
  name: string,
  leader: string,
  maxusers: number,
  lobbyname: string,
  lobbyusers: LobbyUsers,
  appid: number,
  messages: ReceivedMessage[],
}

export interface LobbyUsers {
  [key: string]: User,
}

export interface SendMessage {
  action:       string,
  text:         string,
  suid:         string,
  personaname:  string,
}

export interface ReceivedMessage {
  text:         string,
  suid:         string,
  personaname:  string,
  timestamp:    number,
  mergetimestamp: number | undefined,
  avatarfull:   string,
}

export const defaultAvatarFull = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b5/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg";

export const authServiceEndpointURL: URL = new URL(
	"https://og8ukicoij.execute-api.us-west-2.amazonaws.com/default/auth"
);

export const gamesServiceEndpointURL: URL = new URL(
	"https://zffdaxx75j.execute-api.us-west-2.amazonaws.com/default/GamesService"
);

export const usersServiceEndpointURL: URL = new URL(
	"https://1teuwfqobe.execute-api.us-west-2.amazonaws.com/default/UsersService"
);
