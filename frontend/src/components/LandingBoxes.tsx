import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Game, GamesServiceResponse, fetchGamesServiceAPI } from "../utilities";

export default function LandingBoxes() {
	const [games, setGames] = useState<Game[]>([]);
	const { getAuthToken } = useAuth();

	useEffect(() => {
		const update = async () => {
			try {
				const gamesServiceData: GamesServiceResponse | null =
					await fetchGamesServiceAPI(getAuthToken());

				console.log(gamesServiceData);

				if (gamesServiceData !== null) {
					setGames(gamesServiceData.list_of_games.games.slice(0, 42));
				}
			} catch (err) {
				console.error(err);
			}
		};

		update();
	}, [getAuthToken]);

	return (
		<div className="grid p-3 grid-cols-6 gap-10">
			{(games || []).map((game, index) => {
				return (
					<div key={index} className="bg-white p-2 rounded-lg">
						<h3 className="text-l font-bold mb-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
							{game.name}
						</h3>
						<img
							src={
								"https://cdn.akamai.steamstatic.com/steam/apps/" +
								game.appid +
								"/header.jpg"
							}
							alt={game.name}
							className="w-full h-w object-cover mb-4 rounded-lg"
						/>
					</div>
				);
			})}
		</div>
	);
}
