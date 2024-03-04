import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import Header from "../components/header";
import { useAuth } from "../context/AuthContext";
import {
	authServiceEndpointURL,
	AuthServiceResponse,
	fetchGamesServiceAPI,
	fetchUsersServiceAPI,
	GamesServiceResponse,
	User,
	UsersServiceResponse,
} from "../utilities";

const authEndpointParams: URLSearchParams = new URLSearchParams(
	window.location.search
);

function Auth() {
	const { isLoggedIn, login, logout } = useAuth();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);

	const fetchAuthenticationStatus = async () => {
		const authEndpointURLWithParams: URL = authServiceEndpointURL;
		authEndpointParams.set("openid.mode", "check_authentication");
		authServiceEndpointURL.search = authEndpointParams.toString();

		setIsLoading(true);

		const resp = await fetch(authEndpointURLWithParams);
		const data = await resp.json();

		return data;
	};

	useEffect(() => {
		(async () => {
			const authData: AuthServiceResponse =
				await fetchAuthenticationStatus();
			if (authData.is_valid === true) {
				const gamesServiceData: GamesServiceResponse | null =
					await fetchGamesServiceAPI(authData.jwttoken);
				const usersServiceData: UsersServiceResponse | null =
					await fetchUsersServiceAPI(authData.jwttoken);

				if (gamesServiceData !== null) {
					const user: User = {
						authenticated: true,
						uuid: gamesServiceData.uuid,
						jwttoken: authData.jwttoken,
						games: gamesServiceData.list_of_games.games,
						personaname: usersServiceData?.personaname || "",
						avatarfull: usersServiceData?.avatarfull || "",
					};

					login(JSON.stringify(user));
				}
			}

			if (isLoggedIn()) {
				navigate("/lobbies");
			}
		})();

		const authTimeout = setTimeout(() => {
			setIsLoading(false);
			navigate("/");
			alert("Login failed!");
			logout();
		}, 10000);

		return () => clearTimeout(authTimeout);
	});

	return (
		<div className="bg-[#1A1A1A] h-screen flex flex-col">
			<Header currentGame={null} setCurrentGame={() => {}} />
			<div className="flex-grow flex justify-center items-center">
				<MoonLoader
					color="#9e9fa2"
					size={"100px"}
					loading={isLoading}
				/>
			</div>
		</div>
	);
}

export default Auth;
