import '.././App.css';
import SteamButton from './steam_button.png'

export default function Header() {
    return (
        <div className="flex justify-between items-center pt-10 px-10 pb-10">
            <p className="text-white text-3xl">
                Steam SyncUp
            </p>
            <p className="text-white text-2xl">
                Lobbies
            </p>
            <div className="relative ml-10">
                <input
                    type="text"
                    placeholder="Search"
                    className="text-white text-2xl bg-transparent border border-white rounded-full px-4 py-2 text-center focus:outline-none"
                    style={{ width: "800px", color: "black" }} // Adjust width
                />
            </div>
            <p className="text-white text-2xl ml-10">
                Settings
            </p>

            <a href={'https://store.steampowered.com/'} target="_blank">
                <img src={SteamButton} ></img>
            </a>

        </div>
    );
}
