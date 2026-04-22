import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import {
  BASE_RUN_KNIGHT,
  BASE_RUN_SKELETON,
  BASE_RUN_WIZARD,
} from "@/constants/baseRun";
import { startRun, startNewBattle } from "@/services/actions";
import { hasUnlockedPermanentDeal } from "@/services/selector";
import type { ConfigurableBaseRun, PlayerType } from "@/types/game";
import ChoiceItem from "@/components/ChoiceItem";
import CharacterDescription from "@/components/CharacterDescription";
import Sprite from "@/components/Sprite";

export default function Start() {
  const navigate = useNavigate();
  const [hoverCharacter, setHoverCharacter] = useState<PlayerType | null>(null);

  const hideDescription = useCallback(() => setHoverCharacter(null), []);

  const healthBonus = hasUnlockedPermanentDeal("moreHealth3")
    ? 30
    : hasUnlockedPermanentDeal("moreHealth2")
      ? 20
      : hasUnlockedPermanentDeal("moreHealth1")
        ? 10
        : 0;

  const playerTypeToDescription: Record<
    PlayerType,
    {
      name: React.ReactNode;
      details: React.ReactNode;
    }
  > = {
    knight: {
      name: (
        <>
          <b style={{ color: "darkorange" }}>Knight</b> (
          <b style={{ color: "cyan" }}>
            {BASE_RUN_KNIGHT.health.max + healthBonus}
          </b>{" "}
          HP)
        </>
      ),
      details: (
        <>
          A brave knight who was imprisoned. The Devil offered his help by
          granting him great power... based on a 9x9 slot machine!
        </>
      ),
    },
    skeleton: {
      name: (
        <>
          <b style={{ color: "darkorange" }}>Skeleton</b> (
          <b style={{ color: "cyan" }}>
            {BASE_RUN_SKELETON.health.max + healthBonus}
          </b>{" "}
          HP)
        </>
      ),
      details: (
        <>
          An ancient knight, tricked by the Devil... It starts the run without
          full HP, and its 7x7 machine contains some{" "}
          <b style={{ color: "#953297" }}>cursed</b> symbols.
          <br />
          However, it starts with <b style={{ color: "cyan" }}>
            1
          </b> passive <b style={{ color: "lightgreen" }}>block</b> effect.
        </>
      ),
    },
    wizard: {
      name: (
        <>
          <b style={{ color: "darkorange" }}>Wizard</b> (
          <b style={{ color: "cyan" }}>
            {BASE_RUN_WIZARD.health.max + healthBonus}
          </b>{" "}
          HP)
        </>
      ),
      details: (
        <>
          A powerful mage willing to challenge the Devil. Its 8x8 machine
          contains some <b style={{ color: "gold" }}>improved</b> symbols. The
          middle reel contains the Wizard's entire treasure, but it's a bit
          dirty...
        </>
      ),
    },
  };

  const onPlay = useCallback(
    (playerConfig: ConfigurableBaseRun) => {
      const { health } = playerConfig;

      startRun({
        ...playerConfig,
        health: {
          value: health.value + healthBonus,
          max: health.max + healthBonus,
        },
        levelIndex: 0,
        currentBattle: null,
        randomChoices: [],
      });

      startNewBattle();
      navigate("/battle");
    },
    [navigate, healthBonus],
  );

  return (
    <Screen>
      <h1>Who are you?</h1>
      <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
        <ChoiceItem
          onClick={() => onPlay(BASE_RUN_KNIGHT)}
          onMouseEnter={() => setHoverCharacter("knight")}
          onMouseLeave={hideDescription}
        >
          <Sprite
            imgSrc={`./images/characters/knight.png`}
            tileHeight={32}
            tileWidth={32}
            tileSeparationX={1}
            tileSeparationY={1}
            animations={[
              {
                name: "base_idle",
                tiles: [0, 1],
                duration: 750,
              },
            ]}
            defaultAnimation="base_idle"
            scale={3}
          />
        </ChoiceItem>

        {hasUnlockedPermanentDeal("unlockSkeleton") && (
          <ChoiceItem
            delay={1.5}
            onClick={() => onPlay(BASE_RUN_SKELETON)}
            onMouseEnter={() => setHoverCharacter("skeleton")}
            onMouseLeave={hideDescription}
          >
            <Sprite
              imgSrc={`./images/characters/skeleton_player.png`}
              tileHeight={32}
              tileWidth={32}
              tileSeparationX={1}
              tileSeparationY={1}
              animations={[
                {
                  name: "base_idle",
                  tiles: [0, 1],
                  duration: 750,
                },
              ]}
              defaultAnimation="base_idle"
              scale={3}
            />
          </ChoiceItem>
        )}

        {hasUnlockedPermanentDeal("unlockWizard") && (
          <ChoiceItem
            delay={3}
            onClick={() => onPlay(BASE_RUN_WIZARD)}
            onMouseEnter={() => setHoverCharacter("wizard")}
            onMouseLeave={hideDescription}
          >
            <Sprite
              imgSrc={`./images/characters/wizard_player.png`}
              tileHeight={32}
              tileWidth={32}
              tileSeparationX={1}
              tileSeparationY={1}
              animations={[
                {
                  name: "base_idle",
                  tiles: [0, 1],
                  duration: 750,
                },
              ]}
              defaultAnimation="base_idle"
              scale={3}
            />
          </ChoiceItem>
        )}
      </div>

      <div
        style={{ opacity: hoverCharacter ? 1 : 0, transition: "opacity 0.3s" }}
      >
        <CharacterDescription
          name={
            hoverCharacter ? playerTypeToDescription[hoverCharacter].name : ""
          }
          details={
            hoverCharacter
              ? playerTypeToDescription[hoverCharacter].details
              : ""
          }
        />
      </div>
    </Screen>
  );
}
