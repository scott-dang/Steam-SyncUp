import "../App.css";
import React from "react";
import Header from "../components/header";
import LandingBoxes from "../components/LandingBoxes";

function Landing() {
	return (
		<div className="bg-[#1A1A1A] h-screen">
			<Header></Header>
			<div p-4>
				<LandingBoxes></LandingBoxes>
			</div>
		</div>
	);
}

export default Landing;
