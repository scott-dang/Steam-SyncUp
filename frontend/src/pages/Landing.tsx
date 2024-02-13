import "../App.css";
import React from "react";
import Header from "../components/header";
import LandingBoxes from "../components/LandingBoxes";

function Landing() {
	return (
		<div className="bg-[#1A1A1A] h-screen overflow-hidden">
			<Header></Header>
			<div className="h-full overflow-scroll">
				<LandingBoxes></LandingBoxes>
			</div>
		</div>
	);
}

export default Landing;
