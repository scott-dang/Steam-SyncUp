import React from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

function Information() {
    const { getUser } = useAuth();

    return (
        <div>
            <Header />
			<div className="bg-black h-1 w-full"></div>
            <div className="container py-8 flex flex-col gap-8 items-center">
                <div className="bg-graysecondary p-6 rounded-lg flex flex-col items-center justify-center w-2/3">
                    <h2 className="text-2xl font-bold mb-4 text-center">User Information</h2>
                    <div className="flex items-center">
                        <img
                            src={getUser().avatarfull}
                            alt="avatar"
                            className="w-20 h-20 rounded-full mr-4"
                        />
                        <div>
                            <p className="text-lg font-semibold">{getUser().personaname}</p>
                            <p className="text-gray-400">Logged in as {getUser().personaname}</p>
                        </div>
                    </div>
                </div>
                <hr className="w-1/3 border-gray-400 my-4" />
                <div className="bg-graysecondary p-6 rounded-lg flex flex-col items-center justify-center w-2/3">
                    <h2 className="text-2xl font-bold mb-4 text-center">General Information</h2>
                    <p className="text-lg">
                        asdfasdfasdfasdf
                    </p>
                </div>
                <hr className="w-1/3 border-gray-400 my-4" />
                <div className="bg-graysecondary p-6 rounded-lg flex flex-col items-center justify-center w-2/3">
                    <h2 className="text-2xl font-bold mb-4 text-center">How to Use</h2>
                    <p className="text-lg">
                        asdfasdfasdfasdf
                    </p>
                </div>
                <hr className="w-1/3 border-gray-400 my-4" />
                <div className="bg-graysecondary p-6 rounded-lg flex flex-col items-center justify-center w-2/3">
                    <h2 className="text-2xl font-bold mb-4 text-center">Motivation</h2>
                    <p className="text-lg">
                        asdfasdfasdfasdf
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Information;


