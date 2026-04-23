import { useEffect, useRef } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { getGameState } from "@/services/gameStore";
import { setCurrentPathname } from "@/services/actions";
import { playBackgroundMusicForPathname } from "@/services/backgroundMusic";

function RouterSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  useEffect(() => {
    playBackgroundMusicForPathname(location.pathname);

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
    </>
  );
}

export default MainLayout;
