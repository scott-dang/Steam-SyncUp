import '../App.css';
import SteamButton from './steam_button.png'
import { Link } from 'react-router-dom';
import React from 'react';
import { getBaseUrl } from '../utilities';

const url: URL = new URL("https://steamcommunity.com/openid/login")
url.search = new URLSearchParams({
  'openid.ns': 'http://specs.openid.net/auth/2.0',
  'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
  'openid.return_to': getBaseUrl() + "/auth",
  'openid.realm': getBaseUrl() + "/auth",
  'openid.mode': 'checkid_setup'
}).toString()

const urlString: string = url.toString()

export default function Header() {
    return (
        <div className="flex justify-between items-center pt-10 px-10 pb-10 bg-[#222222]">
            <p className="text-white text-3xl">
                <Link to="/">Steam SyncUp</Link>
            </p>
        <a className="text-white text-2xl" href={"/#"}>
            <Link to="/lobbies">Lobbies</Link>
        </a>
            <div className="relative ml-10">
                <input
                    type="text"
                    placeholder="Search"
                    className="text-white text-2xl bg-transparent border border-white rounded-full px-20 py-2 text-center focus:outline-none"
                    style={{ width: "1/2vw", color: "white" }} // Adjust width
                />
            </div>
            <p className="text-white text-2xl ml-10">
                <Link to="/settings">Settings</Link>
            </p>

            <a href={urlString} target="_blank" rel="noreferrer">
                <img src={SteamButton} alt={""}></img>
            </a>
        </div>
    );
}
