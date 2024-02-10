export interface GamesServiceResponse {
    authenticated: boolean;
    uuid:          string;
    list_of_games: ListOfGames;
}

export interface ListOfGames {
    game_count: number;
    games:      Game[];
}

export interface Game {
    appid:        number;
    name:         string;
    img_icon_url: string;
}

export const isLocalHost = (): boolean => {
  return window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.hostname === "";
}

export const getBaseUrl = (): String => {
  const urlOrigin: String = window.location.origin;
  return urlOrigin;
}

export const fetchUserOwnedGames = async (): Promise<Game[]> => {
  try {
    const resp = await fetch(gamesServiceEndpointURL, {
      headers: {
        "authorization": "Bearer " + localStorage.getItem("jwttoken") || "",
      }
    });

    const data = await resp.json();

    if (data.authenticated === true) {

      const gamesServiceResponse: GamesServiceResponse = data;
      const listOfGames: ListOfGames = gamesServiceResponse.list_of_games;
      const games: Game[] = listOfGames.games;

      return games;
    }

  } catch (err) {
    console.error(err);
  }

  return[];
}

export const steamOpenIdEndpointUrl = (): URL => {

  const url: URL = new URL("https://steamcommunity.com/openid/login")
  url.search = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.return_to': getBaseUrl() + "/auth",
    'openid.realm': getBaseUrl() + "/auth",
    'openid.mode': 'checkid_setup'
  }).toString()

  return url
}

export const authServiceEndpointURL: URL = new URL("https://og8ukicoij.execute-api.us-west-2.amazonaws.com/default/auth");

export const gamesServiceEndpointURL: URL = new URL("https://zffdaxx75j.execute-api.us-west-2.amazonaws.com/default/GamesService");
