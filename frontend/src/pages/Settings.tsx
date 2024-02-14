import React from "react";
import Header from "../components/header";
import { useAuth } from "../context/AuthContext";

function Settings() {
	const { getUser } = useAuth();

	return (
		<div className="bg-[#1A1A1A] h-screen text-white">
			<Header></Header>
			<span className="text-4xl">Settings</span>
			<img
				src={getUser().avatarfull}
				alt={"avatar"}
				className="w-full h-w mb-3 rounded-lg"
			/>
		</div>
	);
}

export default Settings;
