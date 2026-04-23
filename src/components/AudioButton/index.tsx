import { useRef } from "react";
import Sprite, { type SpriteHandle } from "@/components/Sprite";
import { toggleAudio } from "@/services/actions";
import { setAudioEnabled } from "@/services/backgroundMusic";

import { useGameState } from "@/services/gameStore";

import "./style.css";

export default function AudioButton() {
  const state = useGameState();
  const spriteRef = useRef<SpriteHandle>(null);

  const handleClick = () => {
    const newState = toggleAudio();

    setAudioEnabled(newState.audio);
    if (spriteRef.current) {
      spriteRef.current.setTile(newState.audio ? 0 : 1);
    }
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
