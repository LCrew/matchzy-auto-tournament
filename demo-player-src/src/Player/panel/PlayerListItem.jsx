import { Component } from "react";
import "./PlayerListItem.css";

class PlayerListItem extends Component {
  render() {
    const { player, followed, onFollow } = this.props;

    let armor = "";
    if (player.armor > 0) {
      armor = player.helmet ? "vesthelm" : "vest";
    }

    const nades = [];
    for (let gi = 0; gi < 4; gi++) {
      if (player.grenadesList && gi < player.grenadesList.length) {
        const nade = player.grenadesList[gi];
        nades.push(
          <div
            key={gi}
            className={`pli-weapon ${nade}${player.weapon === nade ? " active" : ""}`}
          />
        );
      } else {
        nades.push(<div key={gi} className="pli-weapon" />);
      }
    }

    return (
      <div
        className={`pli-container ${player.team}${followed ? " followed" : ""}`}
        onClick={() => onFollow && onFollow(player.playerid)}
        title={followed ? `Unfollow ${player.name}` : `Follow ${player.name}`}
      >
        {/* HP bar background */}
        <div className="pli-hp-bar">
          <div
            className={`pli-hp-fill ${player.team}`}
            style={{ width: `${player.hp}%` }}
          />
        </div>

        {/* Name row */}
        <div className="pli-name-row">
          <span className={`pli-name ${player.team}`}>{player.name}</span>
          <div className={`pli-vest bckg ${armor}`} />
          <span className={`pli-hp-text${player.alive ? "" : " dead"}`}>
            {player.alive ? player.hp : ""}
          </span>
        </div>

        {/* Weapons row */}
        <div className="pli-weapons-row">
          <div
            className={`pli-weapon bckg${player.defuse ? " defuse" : ""}${player.bomb ? " c4" : ""}${player.weapon === "c4" ? " active" : ""}`}
          />
          <div
            className={`pli-weapon pli-weapon--primary bckg ${player.primary || ""}${player.weapon === player.primary ? " active" : ""}`}
          />
          <div
            className={`pli-weapon bckg ${player.secondary || ""}${player.weapon === player.secondary ? " active" : ""}`}
          />
          <div
            className={`pli-weapon bckg${player.alive ? " knife" : ""}${player.weapon === "knife" ? " active" : ""}`}
          />
          {nades}
        </div>

        {/* Stats row */}
        <div className="pli-stats-row">
          <span className={`pli-ammo ${player.team}`}>
            {player.primary ? `${player.primaryammomagazine}/${player.primaryammoreserve}` : ""}
          </span>
          <span className={`pli-ammo pli-ammo--secondary ${player.team}`}>
            {player.secondary ? `${player.secondaryammomagazine}/${player.secondaryammoreserve}` : ""}
          </span>
          <span className={`pli-kad ${player.team}`} title="K/A/D">
            {`${player.kills ?? 0}/${player.assists ?? 0}/${player.deaths ?? 0}`}
          </span>
          <span className={`pli-money ${player.team}`}>${player.money}</span>
        </div>
      </div>
    );
  }
}

export default PlayerListItem;
