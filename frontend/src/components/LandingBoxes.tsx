import React from 'react';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function LandingBoxes({ setCurrentGame }) {
    const { getUser } = useAuth();


	return (
		<div className="grid grid-cols-6">
			{(getUser().games || []).map((game, index) => {
				<Link to="lobbies"></Link>
				return (
					<Link
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "scale(1.05)";
							e.currentTarget.style.boxShadow = "0 0 2px 2px white inset";
					  	}}
					  	onMouseLeave={(e) => {
							e.currentTarget.style.transform = "scale(1)";
					  	}}
						
						onClick={() => setCurrentGame(game)}
						key={index}
						className="bg-white p-3"
						to="lobbies"
						style={{
							backgroundImage: `url(https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg)`,
							backgroundSize: "cover",
							backdropFilter: "blur(5px)",
							boxShadow: "0 0 4px 4px black inset",
						}}
					>
						<div
							className="absolute inset-0 backdrop-blur-lg"
							style={{
								boxShadow: "0 0 4px 4px black inset",
							}}
						></div>
						<div
							className="absolute inset-0"
							style={{
								background:
									"radial-gradient(circle, transparent, rgba(0,0,0,0.7))",
							}}
						></div>
						<div className="relative p-1">
							<img
								src={
									"https://cdn.akamai.steamstatic.com/steam/apps/" +
									game.appid +
									"/header.jpg"
								}
								alt={game.name}
								className="w-full h-w mb-3 rounded-lg"
							/>
							<h1
								className="text-lg text-white font-bold mb-3 overflow-hidden overflow-ellipsis whitespace-nowrap"
								style={{
									textShadow:
										"1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black",
								}}
							>
								{game.name}
							</h1>
						</div>
					</Link>
				);
			})}
		</div>
	);
}
