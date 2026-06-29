import "./MapBomb.css";
import { Component } from "react";
import c4SvgRaw from "../assets/icons/csgo/c4.svg?raw";

const BOMB_TIMER = 40;
const DEFUSE_KIT = 5;
const DEFUSE_NOKIT = 10;

const SHOW_TIMER_STATES = new Set([5, 1]); // planted, defusing

function toCurrentColor(svgRaw) {
  const wMatch = svgRaw.match(/<svg[^>]*\bwidth="([\d.]+)/);
  const hMatch = svgRaw.match(/<svg[^>]*\bheight="([\d.]+)/);
  const w = wMatch ? wMatch[1] : "100";
  const h = hMatch ? hMatch[1] : "100";
  return svgRaw
    .replace(/<\?xml[^?]*\?>\s*/g, "")
    .replace(/\bfill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/\bstroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
    .replace(/\bfill-opacity="[^"]*"\s*/g, "")
    .replace(/<svg\b/, `<svg viewBox="0 0 ${w} ${h}"`);
}

const C4_SVG = toCurrentColor(c4SvgRaw);

class MapBomb extends Component {
  render() {
    const { bomb, bombPlantedAt, currentRoundtimeSecs } = this.props;
    if (!bomb) return null;

    const { x, y, state } = bomb;
    const showTimer = SHOW_TIMER_STATES.has(state) && bombPlantedAt !== null;

    let remaining = 0;
    if (showTimer) {
      // roundtime counts UP from 0, so elapsed = current - planted
      const elapsed = currentRoundtimeSecs - bombPlantedAt;
      remaining = Math.max(0, BOMB_TIMER - elapsed);
    }

    return (
      <div
        className={`mapBomb-container${state === 3 ? " mapBomb-exploded" : ""}`}
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <div
          className={`mapBomb-icon-wrap${state === 1 ? " mapBomb-defusing" : state === 4 ? " mapBomb-planting" : ""}`}
          style={{ color: state === 1 ? "var(--CTColor)" : "var(--TColor)" }}
          dangerouslySetInnerHTML={{ __html: C4_SVG }}
        />
        {showTimer && (
          <div className="mapBomb-timer">
            <div className="mapBomb-remaining">{remaining.toFixed(1)}s</div>
            <div className={`mapBomb-row mapBomb-kit${remaining < DEFUSE_KIT ? " expired" : ""}`}>
              Kit: {DEFUSE_KIT.toFixed(1)}s
            </div>
            <div className={`mapBomb-row mapBomb-nokit${remaining < DEFUSE_NOKIT ? " expired" : ""}`}>
              No kit: {DEFUSE_NOKIT.toFixed(1)}s
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default MapBomb;
