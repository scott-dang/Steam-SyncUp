import React from "react";
import { ReceivedMessage, defaultAvatarFull, getDateString } from "../utilities";
import { useAuth } from "../context/AuthContext";

/**
 * Function component for a chat area.
 * @param messages A list of messages.
 * @param chatRef A chat persistence reference.
 * @returns An area where chat messages are displayed.
 */
export const ChatArea = ({ messages, chatRef }) => {
    const { getUser } = useAuth();

    return (
      <div
        ref={chatRef}
        className="flex flex-col-reverse p-4 overflow-y-auto h-screen"
        style={{ maxHeight: "calc(90vh - 210px)" }}
      >
        {messages.map((message: ReceivedMessage, index: number) => (
          <div key={index} className="flex-col my-2">
            <div className="flex flex-row items-baseline px-3 py-1">
              <div className="">
                <a
                  href={`https://steamcommunity.com/profiles/${message.suid}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={
                      message.suid === getUser().uuid
                        ? getUser().avatarfull
                        : message.avatarfull || defaultAvatarFull
                    }
                    className="max-w-full max-h-6"
                    alt="User profile"
                  />
                </a>
              </div>
              <div className="ml-1">
                <a
                  href={`https://steamcommunity.com/profiles/${message.suid}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {message.personaname}
                </a>
              </div>
              <div className="ml-3 text-sm">
                {getDateString(new Date(+message.timestamp))}
              </div>
            </div>
            {message.text.split("\n").map((text: string, index: number, arr: string[]) => {
              const isSingleMessage = arr.length === 1;
              const baseStyle = "bg-graysecondary px-3 py-2 text-sm";
              const topRounded = " rounded-t-3xl";
              const bottomRounded = " rounded-b-3xl";

              let style: string;

              if(isSingleMessage) {
                style = `${baseStyle}${topRounded}${bottomRounded}`;
              } else if (index === 0) {
                style = `${baseStyle}${topRounded}`;
              } else if (index === arr.length - 1) {
                style = `${baseStyle}${bottomRounded}`;
              } else {
                style = `${baseStyle}`;
              }

              return (<div className={style} key={index}>
                {text}
              </div>)
            })}
          </div>
        )).reverse()}
      </div>
    );
  };
  
  /**
   * Function component for an input box.
   * @param inputText A prop to display the current state of the input text.
   * @param handleInputChange A handler to update the input text.
   * @param handleSendMessage A handler to send the inputText.
   * @returns An area where chat messages can be input.
   */
  export const InputBox = ({ inputText, handleInputChange, handleSendMessage }) => (
    <div className="absolute bottom-0 w-[65%] p-5">
      <div className="flex flex-row">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          className="flex-grow rounded-2xl border-2 border-gray-500 p-2 bg-transparent text-white"
        />
        <button
          className="bg-gray-700 text-white rounded-2xl px-4 py-2 ml-2 hover:bg-white hover:text-black"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>

  );
  
