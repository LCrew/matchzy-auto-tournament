import "./MapBomb.css";
import { Component } from "react";
import c4Icon from "../assets/icons/csgo/c4.svg";

const bombStateClasses = {
  0: "",
  1: "defusing",
  2: "defused",
  3: "explode",
  4: "planting",
  5: "planted",
};

class MapBomb extends Component {
  render() {
    const style = {
      left: `${this.props.bomb.x}%`,
      top: `${this.props.bomb.y}%`,
    };

    return (
      <div className={`mapBomb ${bombStateClasses[this.props.bomb.state]}`} style={style}>
        <img src={c4Icon} className="mapBomb-icon" alt="C4" />
      </div>
    );
  }
}

export default MapBomb;
