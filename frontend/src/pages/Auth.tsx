import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import Header from '../components/header';
import { authServiceEndpointURL, fetchUserOwnedGames, Game } from '../utilities';

const authEndpointParams: URLSearchParams = new URLSearchParams(window.location.search);

function Auth() {

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
  }

  useEffect(() => {

    (async () => {
      const data = await fetchAuthenticationStatus();

      if (data.is_valid === true) {
        navigate("/lobbies");
        localStorage.setItem("jwttoken", data.jwttoken);

        // Store user games upon sign-in
        const games: Game[] = await fetchUserOwnedGames();
        localStorage.setItem("games", JSON.stringify(games));
        alert("Logged in successfully!");
      }
    })();

    const authTimeout = setTimeout(() => {
      setIsLoading(false);
      navigate("/");
      alert("Login failed!")
    }, 2500)

    return () => clearTimeout(authTimeout);
  }, [navigate])

  return (
    <div className="bg-[#1A1A1A] h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex justify-center items-center">
        <MoonLoader color="#9e9fa2" size={"100px"} loading={isLoading}/>
      </div>
    </div>
  )
}

export default Auth;
