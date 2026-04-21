import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import {
  BASE_RUN_KNIGHT,
  BASE_RUN_SKELETON,
  BASE_RUN_WIZARD,
} from "@/constants/baseRun";
import { startRun, startNewBattle } from "@/services/actions";
import { hasUnlockedPermanentDeal } from "@/services/selector";
import type { ConfigurableBaseRun } from "@/types/game";

export default function Start() {
  const navigate = useNavigate();

  const onPlay = useCallback(
    (playerConfig: ConfigurableBaseRun) => {
      const { health } = playerConfig;

      const healthBonus = hasUnlockedPermanentDeal("moreHealth3")
        ? 30
        : hasUnlockedPermanentDeal("moreHealth2")
          ? 20
          : hasUnlockedPermanentDeal("moreHealth1")
            ? 10
            : 0;

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
    [navigate],
  );

  useEffect(() => {
    if (!hasUnlockedPermanentDeal("unlockSkeleton")) {
      onPlay(BASE_RUN_KNIGHT);
    }
  }, [onPlay]);

  return (
    <Screen>
      <h1>Select your character</h1>
      <p>TODO</p>
      <button onClick={() => onPlay(BASE_RUN_KNIGHT)}>Play as Knight</button>
      <button onClick={() => onPlay(BASE_RUN_SKELETON)}>
        Play as Skeleton
      </button>
      <button onClick={() => onPlay(BASE_RUN_WIZARD)}>Play as Wizard</button>
    </Screen>
  );
}
