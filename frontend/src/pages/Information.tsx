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
					<h2 className="text-2xl font-bold mb-4 text-center">
						User Information
					</h2>
					<div className="flex items-center">
						<img
							src={getUser().avatarfull}
							alt="avatar"
							className="w-20 h-20 rounded-full mr-4"
						/>
						<div>
							<p className="text-lg font-semibold">
								{getUser().personaname}
							</p>
							<p className="text-gray-400">
								Logged in as {getUser().personaname}
							</p>
						</div>
					</div>
				</div>
				<hr className="w-1/3 border-gray-400 my-4" />
				<div className="bg-graysecondary p-6 rounded-lg flex flex-col items-center justify-center w-2/3">
					<h2 className="text-2xl font-bold mb-4 text-center">
						General Information
					</h2>
					<p className="text-lg">
						Steam SyncUp is a place for gamers to connect over
						common games in their Steam libraries. It was developed
						as a project for CSE 403 at The University of
						Washington.
					</p>
					<a
						href="https://github.com/scott-dang/Steam-SyncUp"
						target="_blank"
						rel="noreferrer"
					>
						Click here for the GitHub repository
					</a>
				</div>
				<hr className="w-1/3 border-gray-400 my-4" />
				<div className="bg-graysecondary p-6 rounded-lg flex flex-col items-center justify-center w-2/3">
					<h2 className="text-2xl font-bold mb-4 text-center">
						How to Use
					</h2>
					<p className="text-lg">See the Steam SyncUp user guide</p>
					<a
						href="https://docs.google.com/document/d/16ZKvk1gUsPEMMZL2Fxnd2xqHBqONX7bYJU1QoblGry0"
						target="_blank"
						rel="noreferrer"
					>
						Click here for the user guide
					</a>
				</div>
				<hr className="w-1/3 border-gray-400 my-4" />
				<div className="bg-graysecondary p-6 rounded-lg flex flex-col items-center justify-center w-2/3">
					<h2 className="text-2xl font-bold mb-4 text-center">
						Vision
					</h2>
					<p className="text-lg">
						Steam's broad selection of games is great for variety
						but can also provide challenges for finding common games
						among friends. Steam SyncUp aims to be the place where
						gamers can find common ground so that no gamer has to
						play alone. Whether you need a 4th or are looking to
						build a community around a niche title, Steam SyncUp has
						you covered!
					</p>
				</div>
			</div>
		</div>
	);
}

export default Information;
