import React from 'react';

export default function CreateLobbyForm({ onClose }) {
    return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1A1A1A] bg-opacity-50">
        <div className="bg-[#4C4C4C] rounded-lg p-8">
            <h2 className="text-white text-xl font-bold mb-4">Create Lobby</h2>
            <form onSubmit={onClose}>
            <div className="mb-4">
                <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight "
                id="lobbyName"
                type="text"
                placeholder="Enter Lobby Name"
                />
            </div>
            <div className="flex justify-end">
                <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 mr-2 rounded"
                onClick={onClose}
                >
                Cancel
                </button>
                <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
                >
                Create
                </button>
            </div>
            </form>
        </div>
    </div>
    );
}