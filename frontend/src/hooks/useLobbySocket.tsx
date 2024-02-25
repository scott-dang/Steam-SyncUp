import { useMemo } from "react";
import { Message } from "../utilities";
import useWebSocket from "./useWebSocket";

// Any falsy value should be considered invalid (appid = 0, empty string, etc.)
const isValidLobbyURL = (jwttoken: string, appid: number, leader: string) => {
  return jwttoken && appid && leader;
}

const lobbyUrl = (jwttoken: string, appid: number, leader: string) => {

  const queryParams: URLSearchParams = new URLSearchParams({
    jwttoken: jwttoken,
    appid:    appid.toString(),
    leader:   leader,
  });

  const endpointUrl = new URL("wss://uvchtgqo14.execute-api.us-west-2.amazonaws.com/production/");
  endpointUrl.search = queryParams.toString();

  return endpointUrl.toString();
}

type UseLobbySocketOptions = {
  addMessageToChat: (text: string) => void,
  clearChat: () => void,
}

// Hook that wraps useWebSocket hook for our use case
const useLobbySocket = (jwttoken: string, appid: number, leader: string, options: UseLobbySocketOptions) => {

  const { addMessageToChat, clearChat } = options;

  const isValid = useMemo(() => isValidLobbyURL(jwttoken, appid, leader), [jwttoken, appid, leader])

  const onMessage = (ev: MessageEvent) => {
    try {
      const receivedMessage: Message = JSON.parse(ev.data);
      addMessageToChat(`${receivedMessage.personaname}: ${receivedMessage.text}`)
    } catch (err) {
      console.error("Error receiving message");
    }
  }

  const { webSocketSend, isWebSocketOpen } = useWebSocket(
    (isValid ? lobbyUrl(jwttoken, appid, leader) : ""),
    {
      onMessage, 
      onClose: clearChat,
    }
  );

  const send = (message: Message) => {
    webSocketSend(JSON.stringify(message));
    addMessageToChat(`${message.personaname}: ${message.text}`)
  }

  return { 
    send: send, 
    isOpen: isWebSocketOpen,
  }
}

export default useLobbySocket;
