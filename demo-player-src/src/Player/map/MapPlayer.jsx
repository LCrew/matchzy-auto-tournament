import "./MapPlayer.css";
import { Component } from "react";

class MapPlayer extends Component {
  render() {
    const { player, followed, onFollow } = this.props;
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
      </div>
    );
  }
}

export default MapPlayer;
