import { Component } from "react";
import { MSG_PLAY, MSG_PLAY_ROUND_PROGRESS, MSG_PROGRESS_MOVE } from "../constants";
import "./Timer.css";

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: "0:00",
      progress: 0,
      hovering: false,
    };
    this.messageBus = props.messageBus;
    this.messageBus.listen([8], (msg) => {
      this.setState({ time: msg.roundtime.roundtime });
    });
    this.messageBus.listen([MSG_PLAY_ROUND_PROGRESS], (msg) => {
      this.setState({ progress: msg.progress });
    });
  }

  mouseMove(e) {
    if (e.buttons === 1) {
      this.moveProgress(e);
    }
  }

  mouseDown(e) {
    this.moveProgress(e);
  }

  mouseUp() {
    this.messageBus.emit({ msgtype: MSG_PLAY });
  }

  mouseLeave(e) {
    this.setState({ hovering: false });
    if (e.buttons === 1) {
      this.messageBus.emit({ msgtype: MSG_PLAY });
    }
  }

  mouseEnter() {
    this.setState({ hovering: true });
  }

  moveProgress(e) {
    const barRect = e.currentTarget.getBoundingClientRect();
    const progressWidth = barRect.right - barRect.left;
    const x = e.nativeEvent.x - barRect.left;
    const progress = Math.min(1, Math.max(0, x / progressWidth));
    this.setState({ progress });
    this.messageBus.emit({ msgtype: MSG_PROGRESS_MOVE, progress });
  }

  render() {
    const pct = this.state.progress * 100;
    return (
      <div
        className={`timer-container${this.state.hovering ? " hovering" : ""}`}
        onMouseMove={this.mouseMove.bind(this)}
        onMouseDown={this.mouseDown.bind(this)}
        onMouseUp={this.mouseUp.bind(this)}
        onMouseLeave={this.mouseLeave.bind(this)}
        onMouseEnter={this.mouseEnter.bind(this)}
      >
        <div className="timer-time">{this.state.time}</div>
        <div className="timer-track">
          <div className="timer-fill" style={{ width: `${pct}%` }} />
          <div className="timer-thumb" style={{ left: `${pct}%` }} />
        </div>
      </div>
    );
  }
}

export default Timer;
