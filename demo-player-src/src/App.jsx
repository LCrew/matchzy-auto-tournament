import { useState } from "react";
import { LocationProvider } from "preact-iso";
import { PlayerApp } from "./Player/PlayerApp";
import { DemoContext } from "./context";

export function App() {
  const [demoData, setDemoData] = useState(null);
  return (
    <DemoContext.Provider value={{ demoData, setDemoData }}>
      <LocationProvider>
        <PlayerApp />
      </LocationProvider>
    </DemoContext.Provider>
  );
}
