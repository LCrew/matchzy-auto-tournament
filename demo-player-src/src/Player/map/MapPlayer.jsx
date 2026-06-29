import "./MapPlayer.css";
import { Component } from "react";

class MapPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = { flashStartedAt: null, flashElapsed: 0 };
    this.flashInterval = null;
  }

  componentDidUpdate(prevProps) {
    const wasFlashed = prevProps.player.flashed;
    const isFlashed = this.props.player.flashed;
    if (!wasFlashed && isFlashed) {
      const now = Date.now();
      this.setState({ flashStartedAt: now, flashElapsed: 0 });
      this.flashInterval = setInterval(() => {
        this.setState((s) => ({ flashElapsed: Date.now() - s.flashStartedAt }));
      }, 100);
    } else if (wasFlashed && !isFlashed) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
      this.setState({ flashStartedAt: null, flashElapsed: 0 });
    }
  }

  componentWillUnmount() {
    clearInterval(this.flashInterval);
  }

  render() {
    const { player, followed, onFollow } = this.props;
    const { flashElapsed } = this.state;
    const posStyle = {
      left: `${player.x}%`,
      top: `${player.y}%`,
      background: `linear-gradient(0deg, var(--${player.team}Color) ${player.hp}%, transparent 0%)`,
    };
    const rotStyle = {
      transform: `rotate(${player.rotation}deg) translateY(-50%)`,
    };
    const playerClass = [
      "player",
      player.team,
      player.flashed ? "flashed" : "",
      !player.alive ? "dead" : "",
      followed ? "followed" : "",
    ].filter(Boolean).join(" ");

    return (
      <div
        className={playerClass}
        style={posStyle}
        onClick={() => onFollow && onFollow(player.playerid)}
        title={followed ? `Unfollow ${player.name}` : `Follow ${player.name}`}
      >
        <div className={`playerArrowContainer ${player.team}`}>
          {player.alive && (
            <div className={`playerArrow ${player.team}`} style={rotStyle} />
          )}
        </div>
        <div className={`playerNameTag${followed ? " visible" : ""}`}>{player.name}</div>
        <div className={`playerMapWeapon ${player.weapon}`} />
        {player.flashed && player.alive && (
          <div className="playerFlashIndicator">
            ⚡ {(flashElapsed / 1000).toFixed(1)}s
          </div>
        )}
      </div>
    );
  }
}

export default MapPlayer;
