import { useEffect, useRef } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useMusic } from "wavedash-react";

import AudioButton from "@/components/AudioButton";

import { getGameState } from "@/services/gameStore";
import { setCurrentPathname } from "@/services/actions";
import { getBackgroundMusicForPathname } from "@/services/backgroundMusic";

function RouterSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);
  const { playMusic } = useMusic();

  useEffect(() => {
    playMusic(getBackgroundMusicForPathname(location.pathname));

    if (isFirstRender.current) {
      isFirstRender.current = false;
      const savedPathname = getGameState().currentPathname;

      if (savedPathname && savedPathname !== location.pathname) {
        navigate(savedPathname, { replace: true });
      }
      return;
    }

    setCurrentPathname(location.pathname);
  }, [location.pathname]);

  return null;
}

function MainLayout() {
  return (
    <>
      <ScrollRestoration />
      <RouterSync />
      <Outlet />
      <AudioButton />
    </>
  );
}

export default MainLayout;
