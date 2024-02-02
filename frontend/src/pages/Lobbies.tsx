import '../App.css';
import Header from '../components/header';

function Lobbies() {
  return (
    <div className="">
      <Header></Header>
      <div className="flex flex-row h-screen text-white">
        <div className="bg-[#4C4C4C] w-1/6 text-xl font-bold">
          <p className="pt-2 text-center">
          Games
          </p>
        </div>
        <div className="bg-[#212121] w-1/6 text-xl font-bold">
          <p className="pt-2 text-center">
          Lobbies
          </p>
        </div>
        <div className="flex flex-col bg-[#1A1A1A] w-full">
          <div className="bg-[#212121] h-20 text-white font-bold text-4xl">
            Counter-Strike 2
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobbies;
