export const isLocalHost = (): boolean => {
  return window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.hostname === "";
}

export const getBaseUrl = (): String => {
  const urlOrigin: String = window.location.origin;

  return isLocalHost() ? urlOrigin : "https://" + urlOrigin;
}

export const authServiceEndpointURL: URL = new URL("https://og8ukicoij.execute-api.us-west-2.amazonaws.com/default/auth");
