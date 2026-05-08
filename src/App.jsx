import { useEffect } from 'react';
import { useBBG } from './store/useBBG';
import HubMenu from './hub/pages/HubMenu';
import GameSelect from './hub/pages/GameSelect';
import PartyLobby from './hub/pages/PartyLobby';
import OnlineLobby from './hub/pages/OnlineLobby';
import PlayerProfile from './hub/pages/PlayerProfile';
import SeasonStandings from './hub/pages/SeasonStandings';
import WeeklyMapsPage from './hub/pages/WeeklyMaps';
import HowToPlay from './hub/pages/HowToPlay';
import GangWars from './games/gangwars/GangWars';
import PhoneClient from './hub/components/PhoneClient';
import ToastContainer from './hub/components/ToastContainer';

export default function App() {
  const { currentPage, connect, fetchHubStatus } = useBBG();

  useEffect(() => {
    connect();
    fetchHubStatus();
  }, [connect, fetchHubStatus]);

  const isPhoneClient = typeof window !== 'undefined' && window.location.pathname.startsWith('/join/');

  return (
    <div className="scanlines min-h-screen bg-bbg-void text-bbg-text font-ui">
      {isPhoneClient ? (
        <PhoneClient />
      ) : (
        <>
          {currentPage === 'hub' && <HubMenu />}
          {currentPage === 'game_select' && <GameSelect />}
          {currentPage === 'lobby' && <PartyLobby />}
          {currentPage === 'online' && <OnlineLobby />}
          {currentPage === 'profile' && <PlayerProfile />}
          {currentPage === 'standings' && <SeasonStandings />}
          {currentPage === 'weekly_maps' && <WeeklyMapsPage />}
          {currentPage === 'how_to_play' && <HowToPlay />}
          {currentPage.startsWith('gw_') && <GangWars />}
        </>
      )}

      <ToastContainer />
    </div>
  );
}
