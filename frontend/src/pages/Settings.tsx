import React from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

function Settings() {
	const { getUser } = useAuth();

	return (
		<div className="bg-[#1A1A1A] h-screen text-white">
			<Header></Header>
			<div className="px-5">
				<h1 className="text-3xl mb-2">Settings</h1>
				<text>Logged in as {getUser().personaname}</text>
				<img
					src={getUser().avatarfull}
					alt={"avatar"}
					className="w-60 h-w rounded-lg"
				/>
			</div>
		</div>
	);
}

export default Settings;
