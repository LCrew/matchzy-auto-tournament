import { Component } from "react";
import PlayerListItem from "./PlayerListItem";
import { MSG_FOLLOW_PLAYER } from "../constants";
import "./PlayerList.css";

class PlayerList extends Component {
  constructor(props) {
    super(props);
    this.messageBus = this.props.messageBus;
    this.messageBus.listen([1], this.update.bind(this));
    this.messageBus.listen([MSG_FOLLOW_PLAYER], (msg) => {
      this.setState({ followedPlayerId: msg.playerId });
    });
    this.state = {
      players: [],
      followedPlayerId: null,
    };
  }

  update(msg) {
    this.setState({ players: msg.tickstate.playersList });
  }

  handleFollow(playerId) {
    const next = this.state.followedPlayerId === playerId ? null : playerId;
    this.setState({ followedPlayerId: next });
    this.messageBus.emit({ msgtype: MSG_FOLLOW_PLAYER, playerId: next });
  }

  render() {
    const { players, followedPlayerId } = this.state;
    const tPlayers = [];
    const ctPlayers = [];

    if (players && players.length > 0) {
      players.forEach((p) => {
        const item = (
          <PlayerListItem
            key={p.playerid}
            player={p}
            followed={p.playerid === followedPlayerId}
            onFollow={(id) => this.handleFollow(id)}
          />
        );
        if (p.team === "T") tPlayers.push(item);
        else ctPlayers.push(item);
      });
    }

    return (
      <div className="player-list-container">
        <div className="team-section T">
          <div className="team-list">
            {tPlayers}
          </div>
        </div>
        <div className="team-section CT">
          <div className="team-list">
            {ctPlayers}
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerList;
