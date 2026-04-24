import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import AudioButton from "@/components/AudioButton";

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

if (window.Wavedash) {
  const Wavedash = await window.Wavedash;

  Wavedash.updateLoadProgressZeroToOne(1);
  Wavedash.init({ debug: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router />
    <AudioButton />
  </StrictMode>,
);
