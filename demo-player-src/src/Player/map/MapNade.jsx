import "./MapNade.css";
import { Component } from "react";

import smokeIcon from "../assets/icons/csgo/smoke.svg";
import molotovIcon from "../assets/icons/csgo/molotov.svg";
import incendiaryIcon from "../assets/icons/csgo/incendiary.svg";
import heIcon from "../assets/icons/csgo/he.svg";
import flashIcon from "../assets/icons/csgo/flash.svg";
import decoyIcon from "../assets/icons/csgo/decoy.svg";

const NADE_ICONS = {
  smoke:      smokeIcon,
  molotov:    molotovIcon,
  incendiary: incendiaryIcon,
  fire:       molotovIcon,
  he:         heIcon,
  flash:      flashIcon,
  decoy:      decoyIcon,
};

const NADE_CONFIGS = {
  smoke:      { r: 4.5, duration: 18, burst: false },
  molotov:    { r: 3.5, duration: 7,  burst: false },
  incendiary: { r: 3.5, duration: 7,  burst: false },
  fire:       { r: 3.5, duration: 7,  burst: false },
  he:         { r: 4.5,               burst: true  },
  flash:      { r: 4.5,               burst: true  },
  decoy:      { r: 2.5, duration: 5,  burst: false },
};

const SVG_R = 46;
const SVG_CIRC = Math.round(2 * Math.PI * SVG_R);

class MapNade extends Component {
  componentDidMount() {
    if (this.props.hide) {
      const cfg = NADE_CONFIGS[this.props.nade.kind] || {};
      setTimeout(() => {
        this.props.removeCallback(this.props.index);
      }, cfg.burst ? 520 : 380);
    }
  }

  render() {
    const { nade, hide, team = "T" } = this.props;
    const { kind, x, y, action } = nade;
    const isActive = action === "explode" || hide;
    const cfg = NADE_CONFIGS[kind] || { r: 2.0, duration: 3, burst: false };
    const icon = NADE_ICONS[kind];
    const teamVar = team === "CT" ? "var(--CTColor)" : "var(--TColor)";
    const teamFill = team === "CT" ? "rgba(79,158,222,0.28)" : "rgba(255,122,26,0.28)";

    if (!isActive) {
      // In-flight: icon with team color + white outline
      return (
        <div
          className="mapNade mapNade--inflight"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            backgroundColor: teamVar,
            maskImage: icon ? `url(${icon})` : undefined,
            WebkitMaskImage: icon ? `url(${icon})` : undefined,
          }}
        />
      );
    }

    if (cfg.burst) {
      // Flash / HE: expanding burst in team color
      const size = cfg.r * 2;
      return (
        <div
          className="nade-burst"
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}%`,
            height: `${size}%`,
            marginLeft: `-${cfg.r}%`,
            marginTop: `-${cfg.r}%`,
            background: kind === "flash"
              ? `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${teamVar} 55%, transparent 100%)`
              : `radial-gradient(circle, rgba(255,255,255,0.8) 0%, ${teamVar} 40%, transparent 100%)`,
            pointerEvents: "none",
          }}
        />
      );
    }

    // Active persistent nade (smoke, molotov, decoy): area circle + icon
    const size = cfg.r * 2;
    const isFading = hide;

    return (
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}%`,
          height: `${size}%`,
          marginLeft: `-${cfg.r}%`,
          marginTop: `-${cfg.r}%`,
          transition: isFading ? "opacity 0.38s ease" : "left 60ms linear, top 60ms linear",
          opacity: isFading ? 0 : 1,
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <circle
            cx="50" cy="50" r={SVG_R}
            fill={teamFill}
            stroke={teamVar}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <circle
            cx="50" cy="50" r={SVG_R}
            fill="none"
            stroke={teamVar}
            strokeWidth="2.5"
            strokeDasharray={SVG_CIRC}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ animation: `nade-countdown ${cfg.duration}s linear forwards` }}
          />
        </svg>
        {icon && (
          <div
            className="nade-icon-inner"
            style={{
              backgroundColor: teamVar,
              maskImage: `url(${icon})`,
              WebkitMaskImage: `url(${icon})`,
            }}
          />
        )}
      </div>
    );
  }
}

export default MapNade;
