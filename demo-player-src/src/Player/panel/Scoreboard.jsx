import { Component } from "react";
import { MSG_TEAMSTATE_UPDATE } from "../constants";
import "./Scoreboard.css";

class Scoreboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      TName: "T",
      TScore: 0,
      CTName: "CT",
      CTScore: 0,
    };
    props.messageBus.listen([4, 5], function (msg) {
      this.setState({ TName: msg.init.tname, CTName: msg.init.ctname });
    }.bind(this));

    props.messageBus.listen([MSG_TEAMSTATE_UPDATE], function (msg) {
      this.setState({
        TName: msg.teamstate.tname,
        TScore: msg.teamstate.tscore,
        CTName: msg.teamstate.ctname,
        CTScore: msg.teamstate.ctscore,
      });
    }.bind(this));
  }

  render() {
    return (
      <div className="scoreboard-container">
        <div className="scoreboard-row">
          <div className="score-block">
            <div className="score-number T">{this.state.TScore}</div>
            <div className="team-name T">{this.state.TName}</div>
          </div>
          <div className="score-vs">VS</div>
          <div className="score-block score-block--ct">
            <div className="score-number CT">{this.state.CTScore}</div>
            <div className="team-name CT">{this.state.CTName}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Scoreboard;
