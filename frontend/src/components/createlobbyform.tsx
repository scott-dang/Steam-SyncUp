import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CreateLobbyForm({ onClose, gameId }) {
    const {getAuthToken} = useAuth();

    const [currentLobbyName, setCurrentLobbyName] = useState<string>("");

    const createLobby = async () => {
        try {

            const createLobbyServiceEndpointURL: URL = new URL("https://hj6obivy5m.execute-api.us-west-2.amazonaws.com/default/CreateLobby")
            createLobbyServiceEndpointURL.searchParams.set("game", gameId)
            createLobbyServiceEndpointURL.searchParams.set("name", currentLobbyName)
            createLobbyServiceEndpointURL.searchParams.set("maxusers", "4")

            console.log("Creating lobby")
            setCurrentLobbyName("")
            
            console.log("Fetching lobbies")
            const resp = await fetch(createLobbyServiceEndpointURL, {
            headers: {
                "authorization": "Bearer " + getAuthToken(),
            }
            });

            const data = await resp.json();

            if (data) {
                console.log("Lobby creation success!")
            }
            
        } catch(err) {
            console.error(err)
        }
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentLobbyName(e.target.value)
    }

    return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1A1A1A] bg-opacity-50">
        <div className="bg-[#4C4C4C] rounded-lg p-8">
            <h2 className="text-white text-xl font-bold mb-4">Create Lobby</h2>
            <form onSubmit={onClose}>
            <div className="mb-4">
                <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight "
                id="lobbyName"
                type="text"
                placeholder="Enter Lobby Name"
                onChange={handleInputChange}
                />
            </div>
            <div className="flex justify-end">
                <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mr-2 rounded"
                onClick={() => {
                    onClose();
                    setCurrentLobbyName("")
                }}
                >
                Cancel
                </button>
                <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
                onClick={() => createLobby()}
                >
                Create
                </button>
            </div>
            </form>
        </div>
    </div>
    );
}
