import React from 'react';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function LandingBoxes({ setCurrentGame }) {
    const { getUser } = useAuth();

    const handleImageError = (event) => {
        event.target.style.display = 'none';
    };

    return (
        <div className="grid grid-cols-5 gap-5 p-5">
            {(getUser().games || []).map((game, index) => {
                const imageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`;
                return (
                    imageUrl && (
											<Link className="text-white text-2xl cursor-pointer hover:scale-110 duration-150" to="/lobbies">
                        <img 
                            key={index}
                            className='hover:border hover:border-white hover:scale-110 duration-150 rounded-xl'
                            src={imageUrl}
                            onError={handleImageError}
                        />
												</Link>
                    )
                );
            })}
        </div>
    );
}