import "./MapNade.css";
import { Component } from "react";

import smokeRaw from "../assets/icons/csgo/smoke.svg?raw";
import molotovRaw from "../assets/icons/csgo/molotov.svg?raw";
import incendiaryRaw from "../assets/icons/csgo/incendiary.svg?raw";
import heRaw from "../assets/icons/csgo/he.svg?raw";
import flashRaw from "../assets/icons/csgo/flash.svg?raw";
import decoyRaw from "../assets/icons/csgo/decoy.svg?raw";

// Converts SVG to use currentColor fills and inlines a crisp white outline via feMorphology
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

const NADE_SVG = {
  smoke:      toCurrentColor(smokeRaw,      "mat-smoke"),
  molotov:    toCurrentColor(molotovRaw,    "mat-molotov"),
  incendiary: toCurrentColor(incendiaryRaw, "mat-incendiary"),
  fire:       toCurrentColor(molotovRaw,    "mat-fire"),
  he:         toCurrentColor(heRaw,         "mat-he"),
  flash:      toCurrentColor(flashRaw,      "mat-flash"),
  decoy:      toCurrentColor(decoyRaw,      "mat-decoy"),
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
    // isActive: nade is in its area-of-effect state (smoke cloud, fire, etc.)
    const isActive = action === "explode" || hide;
    const cfg = NADE_CONFIGS[kind] || { r: 2.0, duration: 3, burst: false };
    const svgHtml = NADE_SVG[kind] || null;
    const teamVar = team === "CT" ? "var(--CTColor)" : "var(--TColor)";
    const teamFill = team === "CT" ? "rgba(79,158,222,0.28)" : "rgba(255,122,26,0.28)";

    if (!isActive) {
      // In-flight: small icon colored in team color
      return (
        <div className="mapNade mapNade--inflight" style={{ left: `${x}%`, top: `${y}%` }}>
          {svgHtml && (
            <div
              className="mapNade-icon-wrap"
              style={{ color: teamVar }}
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          )}
        </div>
      );
    }

    if (cfg.burst) {
      // Flash / HE: expanding radial burst
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

    // Active persistent nade (smoke, molotov, decoy): countdown ring + center icon
    const size = cfg.r * 2;

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
          transition: hide ? "opacity 0.38s ease" : "left 60ms linear, top 60ms linear",
          opacity: hide ? 0 : 1,
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        >
          <circle cx="50" cy="50" r={SVG_R} fill={teamFill} stroke={teamVar} strokeWidth="1.2" strokeOpacity="0.7" />
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
        {svgHtml && (
          <div
            className="nade-icon-inner-wrap"
            style={{ color: teamVar }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}
      </div>
    );
  }
}

export default MapNade;
