import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import { BASE_RUN_KNIGHT } from "@/constants/baseRun";
import { startRun, startNewBattle } from "@/services/actions";
import { hasUnlockedPermanentDeal } from "@/services/selector";

export default function Start() {
  const navigate = useNavigate();

  const onPlay = useCallback(() => {
    const { health } = BASE_RUN_KNIGHT;

    const healthBonus = hasUnlockedPermanentDeal("moreHealth3")
      ? 30
      : hasUnlockedPermanentDeal("moreHealth2")
        ? 20
        : hasUnlockedPermanentDeal("moreHealth1")
          ? 10
          : 0;

    startRun({
      ...BASE_RUN_KNIGHT,
      health: {
        value: health.value + healthBonus,
        max: health.max + healthBonus,
      },
      levelIndex: 0,
      currentBattle: null,
      randomChoices: [],
      passiveEffects: [],
    });

    startNewBattle();
    navigate("/battle");
  }, [navigate]);

  return (
    <Screen>
      <h1>Select your character</h1>
      <p>TODO</p>
      <button onClick={onPlay}>Play</button>
    </Screen>
  );
}
