import "./MapNade.css";
import { Component } from "react";

const NADE_CONFIGS = {
  smoke:      { color: "#b0b0b0", fill: "rgba(180,180,180,0.40)", r: 4.5, duration: 18, icon: "☁" },
  molotov:    { color: "#FF6600", fill: "rgba(255,102,0,0.42)",   r: 3.5, duration: 7,  icon: "🔥" },
  incendiary: { color: "#FF6600", fill: "rgba(255,102,0,0.42)",   r: 3.5, duration: 7,  icon: "🔥" },
  fire:       { color: "#FF6600", fill: "rgba(255,102,0,0.42)",   r: 3.5, duration: 7,  icon: "🔥" },
  he:         { color: "#88DD44", fill: "rgba(136,221,68,0.70)",  r: 4.5, burst: true },
  flash:      { color: "#DDDDFF", fill: "rgba(220,220,255,0.80)", r: 4.5, burst: true },
  decoy:      { color: "#FFD700", fill: "rgba(255,215,0,0.22)",   r: 2.5, duration: 5  },
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
    const { nade, hide } = this.props;
    const { kind, x, y, action } = nade;
    const isActive = action === "explode" || hide;
    const cfg = NADE_CONFIGS[kind] || { color: "#ffffff", fill: "rgba(255,255,255,0.15)", r: 2.0, duration: 3 };

    if (!isActive) {
      return (
        <div
          className="mapNade mapNade--dot"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            background: cfg.color,
          }}
        />
      );
    }

    const size = cfg.r * 2;
    const containerStyle = {
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}%`,
      height: `${size}%`,
      marginLeft: `-${cfg.r}%`,
      marginTop: `-${cfg.r}%`,
      pointerEvents: "none",
    };

    if (cfg.burst) {
      return (
        <div
          style={containerStyle}
          className={`nade-burst nade-burst--${kind}`}
        />
      );
    }

    const isFading = hide;
    return (
      <div
        style={{
          ...containerStyle,
          transition: isFading ? "opacity 0.38s ease" : "left 60ms linear, top 60ms linear",
          opacity: isFading ? 0 : 1,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className={`nade-svg nade-svg--${kind}`}
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <circle
            cx="50" cy="50" r={SVG_R}
            fill={cfg.fill}
            stroke={cfg.color}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <circle
            cx="50" cy="50" r={SVG_R}
            fill="none"
            stroke={cfg.color}
            strokeWidth="2.5"
            strokeDasharray={SVG_CIRC}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{
              animation: `nade-countdown ${cfg.duration}s linear forwards`,
            }}
          />
        </svg>
        {cfg.icon && (
          <div className="nade-icon">{cfg.icon}</div>
        )}
      </div>
    );
  }
}

export default MapNade;
