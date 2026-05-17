import { useEffect, useRef } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useMusic } from "wavedash-react";

import AudioButton from "@/components/AudioButton";

import { useCurrentPathname } from "@/services/selector";
import { usePersistentActions, usePersistentMeta } from "@/services/state";
import { getBackgroundMusicForPathname } from "@/services/backgroundMusic";

function RouterSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestoredRef = useRef(false);
  const { playMusic } = useMusic();
  const currentPathname = useCurrentPathname();
  const { setCurrentPathname } = usePersistentActions();
  const { loadStatus } = usePersistentMeta();

  useEffect(() => {
    if (loadStatus !== "ready" || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    if (
      currentPathname &&
      currentPathname !== "/" &&
      currentPathname !== location.pathname
    ) {
      navigate(currentPathname, { replace: true });
    }
  }, [loadStatus, currentPathname, location.pathname, navigate]);

  useEffect(() => {
    playMusic(getBackgroundMusicForPathname(location.pathname));
    if (loadStatus === "ready") {
      setCurrentPathname(location.pathname);
    }
  }, [location.pathname, setCurrentPathname, playMusic, loadStatus]);

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
