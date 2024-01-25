export default function Gameslist() {
    return (
        <div className="flex flex-row h-screen">
            <div className="bg-[#4C4C4C] w-1/6 text-xl font-bold">
                <p className="pt-2">
                Games
                </p>
            </div>
            <div className="bg-[#212121] w-1/6 text-xl font-bold">
                <p className="pt-2">
                Lobbies
                </p>
            </div>
            <div className="flex flex-col bg-[#1A1A1A] w-full">
                 <div className="bg-[#212121] h-20 text-white font-bold text-4xl">
                    Counter-Strike 2
                </div>
            </div>
        </div>
    );
}
