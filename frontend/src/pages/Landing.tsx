import React from "react";
import "../App.css";
import LandingBoxes from "../components/LandingBoxes";
import Carousel from "../components/carousel";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

function Landing({ setCurrentGame }) {
	const { isLoggedIn } = useAuth();

	return isLoggedIn() ? (
		<div className="bg-[#1A1A1A] h-screen overflow-hidden">
			<Header currentGame={undefined} setCurrentGame={undefined}></Header>
			<div className="h-full overflow-scroll">
				<LandingBoxes setCurrentGame={setCurrentGame}></LandingBoxes>
			</div>
		</div>
	) : (
		<div className="bg-[#1A1A1A] h-screen overflow-hidden">
			<Header currentGame={undefined} setCurrentGame={undefined}></Header>
			<Carousel
				cards={[
					{
						image: "https://i.imgur.com/Jm1zfLh.png",
						caption: "Welcome to Steam SyncUp",
					},
					{
						image: "https://i.imgur.com/KIFTCMx.png",
						caption: "Sync your Steam Data",
					},
					{
						image: "https://i.imgur.com/0RIPCor.png",
						caption: "Create Messaging Lobbies",
					},
					{
						image: "https://i.imgur.com/qjhRooE.png",
						caption: "Connect with Fellow Gamers",
					},

					{
						image: "https://i.imgur.com/eF9Tu8d.png",
						caption: "Experience Your Games Together",
					},
				]}
			/>
		</div>
	);
}

export default Landing;
