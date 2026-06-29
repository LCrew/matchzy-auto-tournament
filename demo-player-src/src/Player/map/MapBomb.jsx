import "./MapBomb.css";
import { Component } from "react";
import c4SvgRaw from "../assets/icons/csgo/c4.svg?raw";

const BOMB_TIMER = 40;
const DEFUSE_KIT = 5;
const DEFUSE_NOKIT = 10;
const SHOW_TIMER_STATES = new Set([5, 1]); // planted, defusing

function toCurrentColor(svgRaw, filterId) {
  const wMatch = svgRaw.match(/<svg[^>]*\bwidth="([\d.]+)/);
  const hMatch = svgRaw.match(/<svg[^>]*\bheight="([\d.]+)/);
  const w = wMatch ? wMatch[1] : "100";
  const h = hMatch ? hMatch[1] : "100";

  const filter = `<defs><filter id="${filterId}" x="-15%" y="-15%" width="130%" height="130%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="e"/><feFlood flood-color="white" result="c"/><feComposite in="c" in2="e" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

  return svgRaw
    .replace(/<\?xml[^?]*\?>\s*/g, "")
    .replace(/\bfill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/\bstroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
    .replace(/\bfill-opacity="[^"]*"\s*/g, "")
    .replace(/<svg([^>]*)>/, (_, attrs) =>
      `<svg${attrs} viewBox="0 0 ${w} ${h}">${filter}<g filter="url(#${filterId})">`
    )
    .replace(/<\/svg>/, "</g></svg>");
}

const C4_SVG = toCurrentColor(c4SvgRaw, "mat-c4");

class MapBomb extends Component {
  constructor(props) {
    super(props);
    this.state = { wallRemaining: null };
    this._interval = null;
    this._baseline = { remaining: 0, at: 0 };
  }

  _startTick() {
    if (this._interval) return;
    this._interval = setInterval(() => {
      const age = (Date.now() - this._baseline.at) / 1000;
      const r = Math.max(0, this._baseline.remaining - age);
      this.setState({ wallRemaining: r });
    }, 50);
  }

  _stopTick() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this.setState({ wallRemaining: null });
  }

  componentDidUpdate(prevProps) {
    const { bomb, bombPlantedAt, currentRoundtimeSecs } = this.props;
    const showTimer = bombPlantedAt !== null && bomb && SHOW_TIMER_STATES.has(bomb.state);

    if (!showTimer) {
      if (this._interval) this._stopTick();
      return;
    }

    // Recalibrate whenever the server sends a new roundtime value
    if (
      currentRoundtimeSecs !== prevProps.currentRoundtimeSecs ||
      bombPlantedAt !== prevProps.bombPlantedAt
    ) {
      const elapsed = currentRoundtimeSecs - bombPlantedAt;
      this._baseline = {
        remaining: Math.max(0, BOMB_TIMER - elapsed),
        at: Date.now(),
      };
    }

    this._startTick();
  }

  componentWillUnmount() {
    this._stopTick();
  }

  render() {
    const { bomb, bombPlantedAt, currentRoundtimeSecs } = this.props;
    if (!bomb) return null;

    const { x, y, state } = bomb;
    const showTimer = SHOW_TIMER_STATES.has(state) && bombPlantedAt !== null;

    let remaining = 0;
    if (showTimer) {
      if (this.state.wallRemaining !== null) {
        remaining = this.state.wallRemaining;
      } else {
        const elapsed = currentRoundtimeSecs - bombPlantedAt;
        remaining = Math.max(0, BOMB_TIMER - elapsed);
      }
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
            <div className="mapBomb-remaining">{remaining.toFixed(2)}s</div>
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
