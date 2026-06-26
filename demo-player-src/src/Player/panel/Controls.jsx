import "./Controls.css"
import { Component } from "react";
import { MSG_PLAY_CHANGE, MSG_PLAY_ROUND_INCREMENT, MSG_PLAY_SPEED, MSG_PLAY_TOGGLE, MSG_PROGRESS_MOVE, MSG_PLAY_ROUND_PROGRESS } from "../constants";

const IconSkipPrev = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
  </svg>
);

const IconSkipNext = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const IconPause = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const IconRewind = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z"/>
  </svg>
);

const IconFastForward = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
  </svg>
);

class Controls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      playingSpeed: 1,
      currentProgress: 0,
    };
    this.messageBus = props.messageBus;
    this.messageBus.listen([MSG_PLAY_CHANGE], (msg) => {
      this.setState({ playing: msg.playing });
    });
    this.messageBus.listen([MSG_PLAY_ROUND_PROGRESS], (msg) => {
      this.setState({ currentProgress: msg.progress });
    });
  }

  togglePlay() {
    this.messageBus.emit({ msgtype: MSG_PLAY_TOGGLE });
  }

  playRoundIncrement(inc) {
    this.messageBus.emit({ msgtype: MSG_PLAY_ROUND_INCREMENT, increment: inc });
  }

  setSpeed(speed) {
    this.setState({ playingSpeed: speed });
    this.messageBus.emit({ msgtype: MSG_PLAY_SPEED, speed });
  }

  skipProgress(delta) {
    const next = Math.min(1, Math.max(0, this.state.currentProgress + delta));
    this.messageBus.emit({ msgtype: MSG_PROGRESS_MOVE, progress: next });
  }

  render() {
    const { playing, playingSpeed } = this.state;

    return (
      <div className="controls-container">
        <div className="controls-main">
          <button
            className="ctrl-btn ctrl-round"
            onClick={() => this.playRoundIncrement(-1)}
            title="Previous round"
          >
            <IconSkipPrev />
          </button>
          <button
            className="ctrl-btn ctrl-skip"
            onClick={() => this.skipProgress(-0.05)}
            title="Back 5%"
          >
            <IconRewind />
          </button>
          <button
            className="ctrl-btn ctrl-play"
            onClick={() => this.togglePlay()}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>
          <button
            className="ctrl-btn ctrl-skip"
            onClick={() => this.skipProgress(0.05)}
            title="Forward 5%"
          >
            <IconFastForward />
          </button>
          <button
            className="ctrl-btn ctrl-round"
            onClick={() => this.playRoundIncrement(1)}
            title="Next round"
          >
            <IconSkipNext />
          </button>
        </div>
        <div className="controls-speed">
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              className={`ctrl-speed-btn${playingSpeed === s ? " active" : ""}`}
              onClick={() => this.setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default Controls;
