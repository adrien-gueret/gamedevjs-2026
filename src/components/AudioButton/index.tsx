import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSound, useAudio, useMusic } from "wavedash-react";

import Sprite, { type SpriteHandle } from "@/components/Sprite";

import { useGameState } from "@/services/gameStore";

import "./style.css";
import { getBackgroundMusicForPathname } from "@/services/backgroundMusic";

export default function AudioButton() {
  const state = useGameState();
  const location = useLocation();
  const spriteRef = useRef<SpriteHandle>(null);
  const { playSound } = useSound("click");
  const { toggleAudio } = useAudio();
  const { playMusic } = useMusic();

  const handleClick = () => {
    const newState = toggleAudio();

    if (spriteRef.current) {
      spriteRef.current.setTile(newState ? 0 : 1);
    }

    playSound();
    playMusic(getBackgroundMusicForPathname(location.pathname));
  };

  return (
    <div className="audio-button">
      <button onClick={handleClick}>
        <Sprite
          ref={spriteRef}
          imgSrc={`./images/audio.png`}
          tileHeight={32}
          tileWidth={32}
          tileSeparationX={0}
          tileSeparationY={0}
          defaultTile={state.audio ? 0 : 1}
          scale={2}
        />
      </button>
    </div>
  );
}
