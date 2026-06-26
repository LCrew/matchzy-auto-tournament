import "./MapNade.css";
import { Component } from "react";

const NADE_CONFIGS = {
  smoke:      { color: "#b0b0b0", fill: "rgba(180,180,180,0.12)", r: 4.5, duration: 18 },
  molotov:    { color: "#FF6600", fill: "rgba(255,102,0,0.12)",   r: 3.5, duration: 7  },
  incendiary: { color: "#FF6600", fill: "rgba(255,102,0,0.12)",   r: 3.5, duration: 7  },
  fire:       { color: "#FF6600", fill: "rgba(255,102,0,0.12)",   r: 3.5, duration: 7  },
  he:         { color: "#88DD44", fill: "rgba(136,221,68,0.18)",  r: 4.0, duration: 0.5 },
  flash:      { color: "#DDDDFF", fill: "rgba(220,220,255,0.18)", r: 3.5, duration: 1.5 },
  decoy:      { color: "#FFD700", fill: "rgba(255,215,0,0.14)",   r: 2.5, duration: 5  },
};

// SVG circle radius (in viewBox units 0-100), circumference ≈ 2π*46 ≈ 289
const SVG_R = 46;
const SVG_CIRC = Math.round(2 * Math.PI * SVG_R);

class MapNade extends Component {
  componentDidMount() {
    if (this.props.hide) {
      setTimeout(() => {
        this.props.removeCallback(this.props.index);
      }, 350);
    }
  }

  render() {
    const { nade, hide } = this.props;
    const { kind, x, y, action } = nade;
    const isActive = action === "explode" || hide;
    const cfg = NADE_CONFIGS[kind] || { color: "#ffffff", fill: "rgba(255,255,255,0.1)", r: 2.0, duration: 3 };

    if (!isActive) {
      // In-flight: small dot
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
      transition: hide ? "opacity 0.35s ease" : "left 60ms linear, top 60ms linear",
      opacity: hide ? 0 : 1,
      pointerEvents: "none",
    };

    return (
      <div style={containerStyle}>
        <svg
          viewBox="0 0 100 100"
          className={`nade-svg nade-svg--${kind}`}
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Max radius fill circle */}
          <circle
            cx="50" cy="50" r={SVG_R}
            fill={cfg.fill}
            stroke={cfg.color}
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          {/* Radial countdown arc */}
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
          {/* Center dot */}
          <circle cx="50" cy="50" r="2.5" fill={cfg.color} opacity="0.9" />
        </svg>
      </div>
    );
  }
}

export default MapNade;
