import { Component } from "react";
import { MSG_INIT_ROUNDS, MSG_PLAY, MSG_PLAY_ROUND_UPDATE } from "../constants";
import "./RoundNav.css";

class RoundNav extends Component {
  constructor(props) {
    super(props);
    this.state = { rounds: [] };
    this.messageBus = props.messageBus;
    this.messageBus.listen([MSG_INIT_ROUNDS], function (msg) {
      const rounds = [];
      msg.rounds.forEach((r) => {
        rounds.push(
          <Round
            key={`round${r.roundno}`}
            winner={r.winner}
            roundNo={r.roundno}
            messageBus={this.messageBus}
          />
        );
        if (r.roundno <= 24 && r.roundno % 12 === 0) {
          rounds.push(<div key={`break${r.roundno}`} className="round-break" />);
        } else if (r.roundno > 24 && r.roundno % 6 === 0) {
          rounds.push(<div key={`break${r.roundno}`} className="round-break" />);
        }
      });
      this.setState({ rounds });
    }.bind(this));
  }

  render() {
    return (
      <div className="round-nav-container">
        <div className="round-nav-grid">{this.state.rounds}</div>
      </div>
    );
  }
}

export default RoundNav;

class Round extends Component {
  constructor(props) {
    super(props);
    this.state = { active: false };
    this.messageBus = props.messageBus;
    this.messageBus.listen([MSG_PLAY_ROUND_UPDATE], function (msg) {
      this.setState({ active: msg.round === this.props.roundNo });
    }.bind(this));
  }

  playRound(round) {
    this.messageBus.emit({ msgtype: MSG_PLAY, round });
  }

  render() {
    return (
      <button
        className={`roundNav ${this.props.winner}${this.state.active ? " active" : ""}`}
        onClick={() => this.playRound(this.props.roundNo)}
      >
        {this.props.roundNo}
      </button>
    );
  }
}
