import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { WavedashProvider } from "wavedash-react";

import { StateProvider } from "@/services/state";

import "./index.css";
import Router from "./Router";

if (!document.startViewTransition) {
  // @ts-expect-error This is a simple polyfill, no needs to be 100% compliant
  document.startViewTransition = (callback) => {
    if (typeof callback !== "function") {
      throw new TypeError(
        "The argument to startViewTransition must be a function",
      );
    }
    callback();

    return {
      finished: Promise.resolve(),
    };
  };
}

if (!("structuredClone" in globalThis)) {
  (globalThis as any).structuredClone = (obj: unknown) =>
    JSON.parse(JSON.stringify(obj));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WavedashProvider
      preload={{
        images: [
          "./images/characters/knight.png",
          "./images/machine-borders.png",
          "./images/reel.png",
          "./images/separator.png",
          "./images/slots/sword.png",
          "./images/slots/shield.png",
          "./images/scenes/battle.png",
        ],
        audio: {
          title: ["./audio/musics/title.ogg", "./audio/musics/title.mp3"],
          battle: ["./audio/musics/battle.ogg", "./audio/musics/battle.mp3"],
          shop: ["./audio/musics/shop.ogg", "./audio/musics/shop.mp3"],
          gameover: [
            "./audio/musics/gameover.ogg",
            "./audio/musics/gameover.mp3",
          ],
          acceptDeal: [
            "./audio/sounds/accept_deal.ogg",
            "./audio/sounds/accept_deal.mp3",
          ],
          activeCursedSymbol: [
            "./audio/sounds/active_cursed_symbol.ogg",
            "./audio/sounds/active_cursed_symbol.mp3",
          ],
          activeSymbol: [
            "./audio/sounds/active_symbol.ogg",
            "./audio/sounds/active_symbol.mp3",
          ],
          click: ["./audio/sounds/click.ogg", "./audio/sounds/click.mp3"],
          curseSymbol: [
            "./audio/sounds/curse_symbol.ogg",
            "./audio/sounds/curse_symbol.mp3",
          ],
          heal: ["./audio/sounds/heal.ogg", "./audio/sounds/heal.mp3"],
          hit: ["./audio/sounds/hit.ogg", "./audio/sounds/hit.mp3"],
          insertSymbol: [
            "./audio/sounds/insert_symbol.ogg",
            "./audio/sounds/insert_symbol.mp3",
          ],
          lock: ["./audio/sounds/lock.ogg", "./audio/sounds/lock.mp3"],
          removeSymbol: [
            "./audio/sounds/remove_symbol.ogg",
            "./audio/sounds/remove_symbol.mp3",
          ],
          spin: ["./audio/sounds/spin.ogg", "./audio/sounds/spin.mp3"],
          startSpin: [
            "./audio/sounds/start_spin.ogg",
            "./audio/sounds/start_spin.mp3",
          ],
          stopSpin: [
            "./audio/sounds/stop_spin.ogg",
            "./audio/sounds/stop_spin.mp3",
          ],
        },
      }}
      defaultMusicVolume={0.5}
      defaultSoundsVolume={1}
    >
      <StateProvider
        saveOptions={{
          fileName: "THE_DEVILE_MACHINE_STORAGE_KEY",
          autoSave: true,
          autoLoad: true,
        }}
      >
        <Router />
      </StateProvider>
    </WavedashProvider>
  </StrictMode>,
);
