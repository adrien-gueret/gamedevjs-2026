import React, { useCallback, useState, useMemo } from "react";
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
import { generateBaseRunFromString } from "@/services/customRun";
import { useWavedash } from "@/services/wavedash";

type PossiblePlayer = PlayerType | "ethereum" | "wavedash";

export default function Start() {
  const navigate = useNavigate();
  const [hoverCharacter, setHoverCharacter] = useState<PossiblePlayer | null>(
    null,
  );

  const hideDescription = useCallback(() => setHoverCharacter(null), []);

  const healthBonus = hasUnlockedPermanentDeal("moreHealth3")
    ? 30
    : hasUnlockedPermanentDeal("moreHealth2")
      ? 20
      : hasUnlockedPermanentDeal("moreHealth1")
        ? 10
        : 0;

  const wavedash = useWavedash();

  const wavedashUser: {
    id: string;
    name: string;
    avatar: string | null;
  } | null = useMemo(() => {
    if (!wavedash) {
      return null;
    }

    const userId = wavedash.getUserId();
    const url = wavedash.getUserAvatarUrl(userId, 1);

    return {
      id: userId,
      name: wavedash.getUsername(),
      avatar: url,
    };
  }, [wavedash]);

  const playerTypeToDescription: Record<
    PossiblePlayer,
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
          This brave knight is imprisoned. The Devil offered him a deal: a great
          power… at a terrible cost. Now, every action he takes is determined by
          a 9x9 slot machine! Will he escape his prison and reclaim his freedom?
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
          This ancient knight was tricked by the Devil... He starts the run
          without full HP, and his 7x7 machine contains some{" "}
          <b style={{ color: "#953297" }}>cursed</b> symbols.
          <br />
          However, he starts with <b style={{ color: "cyan" }}>
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
          This wizard seeks revenge on the Devil. His 8x8 machine has some{" "}
          <b style={{ color: "gold" }}>improved</b> symbols. The middle reel
          contains his entire treasure, but it's a bit dirty...
        </>
      ),
    },
    random: {
      name: (
        <>
          <b style={{ color: "darkorange" }}>Randy</b> (
          <b style={{ color: "cyan" }}>???</b> HP)
        </>
      ),
      details: (
        <>
          Nobody knows who he is... not even Randy himself! He woke up in the
          Devil's prison with no memories... Who knows what kind of machine
          he'll get this time?
        </>
      ),
    },
    wavedash: {
      name: (
        <>
          <b style={{ color: "darkorange" }}>{wavedashUser?.name}</b> (
          <b style={{ color: "cyan" }}>???</b> HP)
        </>
      ),
      details: (
        <>
          That's you! Your machine is unique, based on your{" "}
          <b style={{ color: "gold" }}>Wavedash</b> profile. Will you be a
          Knight, a Skeleton or a Wizard? Only one way to find out... Good luck
          escaping the Devil's prison!
        </>
      ),
    },
    ethereum: {
      name: (
        <>
          <b style={{ color: "darkorange" }}>Ethereum</b> (
          <b style={{ color: "cyan" }}>???</b> HP)
        </>
      ),
      details: (
        <>
          Connect your <b style={{ color: "gold" }}>Ethereum</b> wallet and play
          as your on-chain avatar! Your machine and skin will be generated based
          on your wallet's address. Will you be able to escape the Devil's
          prison and reclaim your freedom?
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

  const onPlayEthereum = useCallback(async () => {
    if (!window.ethereum) {
      return;
    }

    try {
      const provider = window.ethereum;

      let accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];

      if (!accounts.length) {
        accounts = (await provider.request({
          method: "eth_requestAccounts",
        })) as string[];
      }

      const address = accounts[0];

      if (!address) {
        return;
      }

      onPlay(generateBaseRunFromString(address));
    } catch {}
  }, [onPlay]);

  return (
    <Screen>
      <h1>Who are you?</h1>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 32,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
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

        {hasUnlockedPermanentDeal("unlockRandom") && (
          <ChoiceItem
            delay={4.5}
            onClick={() =>
              onPlay(
                generateBaseRunFromString(
                  (Date.now() * Math.random()).toString(),
                  "random",
                ),
              )
            }
            onMouseEnter={() => setHoverCharacter("random")}
            onMouseLeave={hideDescription}
          >
            <Sprite
              imgSrc={`./images/characters/random_player.png`}
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

        {wavedashUser && (
          <ChoiceItem
            delay={5}
            onClick={() => onPlay(generateBaseRunFromString(wavedashUser.id))}
            onMouseEnter={() => setHoverCharacter("wavedash")}
            onMouseLeave={hideDescription}
          >
            {wavedashUser.avatar ? (
              <div style={{ width: 96, height: 96 }}>
                <img
                  src={wavedashUser.avatar}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                  alt=""
                />
              </div>
            ) : (
              <Sprite
                imgSrc={`./images/characters/random_player.png`}
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
            )}
          </ChoiceItem>
        )}

        {Boolean(window.ethereum) && (
          <ChoiceItem
            delay={5}
            onClick={() => onPlayEthereum()}
            onMouseEnter={() => setHoverCharacter("ethereum")}
            onMouseLeave={hideDescription}
          >
            <Sprite
              imgSrc={`./images/characters/ethereum_player.png`}
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
