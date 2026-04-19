import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import { BASE_RUN_KNIGHT } from "@/constants/baseRun";
import { startRun, startNewBattle } from "@/services/actions";

export default function Start() {
  const navigate = useNavigate();

  const onPlay = useCallback(() => {
    startRun({
      ...BASE_RUN_KNIGHT,
      levelIndex: 0,
      currentBattle: null,
      randomChoices: [],
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
