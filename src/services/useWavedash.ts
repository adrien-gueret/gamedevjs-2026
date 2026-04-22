import { useEffect, useState } from "react";

async function getWavedashApi(): Promise<WavedashApi | null> {
  if (!window.Wavedash) {
    return null;
  }

  return await window.Wavedash;
}

export default function useWavedash() {
  const [wavedash, setWavedash] = useState<WavedashApi | null>(null);

  useEffect(() => {
    if (window.Wavedash) {
      getWavedashApi().then((api) => {
        setWavedash(api);
      });
    }
  }, []);

  return wavedash;
}
