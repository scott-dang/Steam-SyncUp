import React, { useEffect } from 'react';
import Header from '../components/header';
import { authServiceEndpointURL } from '../utilities';

const authEndpointParams: URLSearchParams = new URLSearchParams(window.location.search);

function Auth() {

  useEffect(() => {

    const authEndpointURLWithParams: URL = authServiceEndpointURL;
    authEndpointParams.set("openid.mode", "check_authentication");
    authServiceEndpointURL.search = authEndpointParams.toString();

    fetch(authEndpointURLWithParams).then((resp) => {
      resp.json().then((data) => {
        alert(JSON.stringify(data));
      })
    });
  }, [])

  return (
    <Header />
  )
}

export default Auth;
