import "./MapBomb.css";
import { Component } from "react";
import c4Icon from "../assets/icons/csgo/c4.svg";

const BOMB_TIMER = 40;
const DEFUSE_KIT = 5;
const DEFUSE_NOKIT = 10;

// state 5 = planted, state 1 = defusing
const SHOW_TIMER_STATES = new Set([5, 1]);

class MapBomb extends Component {
  render() {
    const { bomb, bombPlantedAt, currentRoundtimeSecs } = this.props;
    if (!bomb) return null;

    const { x, y, state } = bomb;
    const showTimer = SHOW_TIMER_STATES.has(state) && bombPlantedAt !== null;

    let remaining = 0;
    let kitWindow = 0;
    let nokitWindow = 0;

    if (showTimer) {
      const elapsed = bombPlantedAt - currentRoundtimeSecs;
      remaining = Math.max(0, BOMB_TIMER - elapsed);
      kitWindow = remaining - DEFUSE_KIT;
      nokitWindow = remaining - DEFUSE_NOKIT;
    }

    return (
      <div
        className={`mapBomb-container${state === 3 ? " mapBomb-exploded" : ""}`}
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <div
          className={`mapBomb-icon${state === 1 ? " mapBomb-defusing" : state === 4 ? " mapBomb-planting" : ""}`}
          style={{
            backgroundColor: "var(--TColor)",
            maskImage: `url(${c4Icon})`,
            WebkitMaskImage: `url(${c4Icon})`,
          }}
        />
        {showTimer && (
          <div className="mapBomb-timer">
            <div className="mapBomb-remaining">{remaining.toFixed(1)}s</div>
            <div className={`mapBomb-row mapBomb-kit${kitWindow < 0 ? " expired" : ""}`}>
              Kit: {Math.max(0, kitWindow).toFixed(1)}s
            </div>
            <div className={`mapBomb-row mapBomb-nokit${nokitWindow < 0 ? " expired" : ""}`}>
              No kit: {Math.max(0, nokitWindow).toFixed(1)}s
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default MapBomb;
