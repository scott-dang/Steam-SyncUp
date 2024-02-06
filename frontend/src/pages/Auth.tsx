import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import Header from '../components/header';
import { authServiceEndpointURL } from '../utilities';

const authEndpointParams: URLSearchParams = new URLSearchParams(window.location.search);

function Auth() {

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const authEndpointURLWithParams: URL = authServiceEndpointURL;
    authEndpointParams.set("openid.mode", "check_authentication");
    authServiceEndpointURL.search = authEndpointParams.toString();

    setIsLoading(true);

    fetch(authEndpointURLWithParams).then((resp) => {
      resp.json().then((data) => {
        if (data.is_valid === true) {
          navigate("/lobbies");
          alert("Logged in successfully!");
        }
      })
    });

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
