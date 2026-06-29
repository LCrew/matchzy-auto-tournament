import { Component, createRef } from "react";
import { MSG_PLAY_CHANGE, MSG_FOLLOW_PLAYER } from "../constants";
import KillFeed from "./KillFeed";
import "./Map.css";
import MapBomb from "./MapBomb";
import MapNade from "./MapNade";
import MapPlayer from "./MapPlayer";
import MapShot from "./MapShot";

// Import map overviews
import deAncient from "../../assets/overviews/de_ancient.png";
import deAncientNight from "../../assets/overviews/de_ancient_night.png";
import deAnubis from "../../assets/overviews/de_anubis.png";
import deCache from "../../assets/overviews/de_cache.png";
import deDust2 from "../../assets/overviews/de_dust2.png";
import deInferno from "../../assets/overviews/de_inferno.png";
import deMirage from "../../assets/overviews/de_mirage.png";
import deNuke from "../../assets/overviews/de_nuke.png";
import deNukeLower from "../../assets/overviews/de_nuke_lower.png";
import deOverpass from "../../assets/overviews/de_overpass.png";
import deTrain from "../../assets/overviews/de_train.png";
import deTrainLower from "../../assets/overviews/de_train_lower.png";
import deVertigo from "../../assets/overviews/de_vertigo.png";
import deVertigoLower from "../../assets/overviews/de_vertigo_lower.png";
import emptyMap from "../../assets/overviews/empty.png";

const mapOverviews = {
  de_ancient: deAncient,
  de_ancient_night: deAncientNight,
  de_anubis: deAnubis,
  de_cache: deCache,
  de_dust2: deDust2,
  de_inferno: deInferno,
  de_mirage: deMirage,
  de_nuke: deNuke,
  de_nuke_lower: deNukeLower,
  de_overpass: deOverpass,
  de_train: deTrain,
  de_train_lower: deTrainLower,
  de_vertigo: deVertigo,
  de_vertigo_lower: deVertigoLower,
  empty: emptyMap,
};

const FOLLOW_ZOOM = 1.8;

function parseRoundtime(str) {
  if (!str) return 0;
  const parts = str.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(str) || 0;
}

class Map2d extends Component {
  constructor(props) {
    super(props);
    this.mapRef = createRef();
    this.state = {
      mapName: "empty",
      layer: "",
      hasLower: false,
      players: [],
      shots: [],
      nades: [],
      nadeExplosions: [],
      bomb: { x: -100, y: -100, state: 0 },
      zoom: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      followedPlayerId: null,
      followedPlayerName: null,
      nadeTeams: {},
      bombPlantedAt: null,
      currentRoundtimeSecs: 0,
    };

    props.messageBus.listen([4], this.onMessage.bind(this));
    props.messageBus.listen([1], this.tickUpdate.bind(this));
    props.messageBus.listen([8], this.handleTimeUpdate.bind(this));
    props.messageBus.listen([9], this.handleShot.bind(this));
    props.messageBus.listen([MSG_PLAY_CHANGE], function () {
      this.setState({ shots: [], nadeExplosions: [], nadeTeams: {}, bombPlantedAt: null });
    }.bind(this));
    props.messageBus.listen([14], this.handleNadeExplosion.bind(this));
    props.messageBus.listen([MSG_FOLLOW_PLAYER], function (msg) {
      if (!msg.playerId) {
        this.setState({ followedPlayerId: null, followedPlayerName: null, zoom: 1, panX: 0, panY: 0 });
      } else {
        this.setState({ followedPlayerId: msg.playerId, zoom: FOLLOW_ZOOM });
      }
    }.bind(this));

    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleTimeUpdate(msg) {
    const secs = parseRoundtime(msg.roundtime?.roundtime);
    this.setState({ currentRoundtimeSecs: secs });
  }

  tickUpdate(message) {
    if (!message.tickstate.playersList) return;

    const players = message.tickstate.playersList;
    const nades = message.tickstate.nadesList || [];
    const bomb = message.tickstate.bomb;

    const newState = { players, nades, bomb };

    // Infer grenade team from nearest alive player when grenade first seen
    const nadeTeams = { ...this.state.nadeTeams };
    nades.forEach((nade) => {
      if (nadeTeams[nade.id] !== undefined) return;
      let minDist = Infinity;
      let nearestTeam = "T";
      players.forEach((p) => {
        if (!p.alive) return;
        const dx = p.x - nade.x;
        const dy = p.y - nade.y;
        const d = dx * dx + dy * dy;
        if (d < minDist) { minDist = d; nearestTeam = p.team; }
      });
      nadeTeams[nade.id] = nearestTeam;
    });
    newState.nadeTeams = nadeTeams;

    // Track bomb plant time (roundtime counts down, so record it at plant moment)
    const prevBombState = this.state.bomb?.state;
    if (bomb) {
      if (bomb.state === 5 && prevBombState !== 5) {
        newState.bombPlantedAt = this.state.currentRoundtimeSecs;
      } else if (bomb.state !== 5 && bomb.state !== 1 && (prevBombState === 5 || prevBombState === 1)) {
        newState.bombPlantedAt = null;
      }
    }

    if (this.state.followedPlayerId && this.mapRef.current) {
      const followed = players.find((p) => p.playerid === this.state.followedPlayerId);
      if (followed) {
        const el = this.mapRef.current;
        const W = el.offsetWidth;
        const H = el.offsetHeight;
        newState.panX = (0.5 - followed.x / 100) * W;
        newState.panY = (0.5 - followed.y / 100) * H;
        if (newState.followedPlayerName !== followed.name) {
          newState.followedPlayerName = followed.name;
        }
      }
    }

    this.setState(newState);
  }

  handleFollow(playerId) {
    const next = this.state.followedPlayerId === playerId ? null : playerId;
    const nextPlayer = next ? this.state.players.find((p) => p.playerid === next) : null;
    const nextName = nextPlayer ? nextPlayer.name : null;
    const resetZoom = !next ? { zoom: 1, panX: 0, panY: 0, followedPlayerName: null } : { zoom: FOLLOW_ZOOM };
    this.setState({ followedPlayerId: next, ...resetZoom });
    this.props.messageBus.emit({ msgtype: MSG_FOLLOW_PLAYER, playerId: next, playerName: nextName });
  }

  handleShot(msg) {
    this.setState({ shots: [...this.state.shots, msg.shot] });
  }

  handleNadeExplosion(msg) {
    const nade = msg.grenadeevent;
    const team = this.state.nadeTeams[nade.id] || "T";
    this.setState({ nadeExplosions: [...this.state.nadeExplosions, { ...nade, team }] });
  }

  onMessage(message) {
    if (message.msgtype === 4) {
      this.setMapName(message.init.mapname);
    }
  }

  setMapName(name) {
    const hasLower = name === "de_nuke" || name === "de_train" || name === "de_vertigo";
    this.setState({ mapName: name, layer: "", hasLower });
  }

  removeNade(index) {
    const newState = [...this.state.nadeExplosions];
    newState[index] = null;
    this.setState({ nadeExplosions: newState });
  }

  removeShot(index) {
    const newState = [...this.state.shots];
    newState[index] = null;
    this.setState({ shots: newState });
  }

  toggleLayer() {
    if (this.state.hasLower) {
      this.setState({ layer: this.state.layer === "_lower" ? "" : "_lower" });
    }
  }

  handleKeyDown(event) {
    if (event.key === "q" || event.key === "Q") {
      this.toggleLayer();
    } else if (event.key === "w" || event.key === "W") {
      this.resetZoom();
    } else if (event.key === "Escape") {
      if (this.state.followedPlayerId) {
        this.handleFollow(null);
        this.setState({ followedPlayerId: null, followedPlayerName: null, zoom: 1, panX: 0, panY: 0 });
        this.props.messageBus.emit({ msgtype: MSG_FOLLOW_PLAYER, playerId: null });
      }
    }
  }

  handleMouseDown = (e) => {
    if (this.state.followedPlayerId) return;
    if (this.state.zoom > 1) {
      this.setState({ isDragging: true, lastMouseX: e.clientX, lastMouseY: e.clientY });
    }
  };

  handleMouseMove = (e) => {
    if (this.state.isDragging && !this.state.followedPlayerId) {
      const deltaX = e.clientX - this.state.lastMouseX;
      const deltaY = e.clientY - this.state.lastMouseY;
      this.setState({
        panX: this.state.panX + deltaX,
        panY: this.state.panY + deltaY,
        lastMouseX: e.clientX,
        lastMouseY: e.clientY,
      });
    }
  };

  handleMouseUp = () => {
    this.setState({ isDragging: false });
  };

  handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    this.setState({ zoom: Math.min(Math.max(this.state.zoom * zoomFactor, 1), 4) });
  };

  resetZoom() {
    this.setState({ zoom: 1, panX: 0, panY: 0, followedPlayerId: null, followedPlayerName: null });
    this.props.messageBus.emit({ msgtype: MSG_FOLLOW_PLAYER, playerId: null });
  }

  render() {
    const { zoom, panX, panY, followedPlayerId, followedPlayerName, isDragging } = this.state;
    const mapKey = `${this.state.mapName}${this.state.layer}`;
    const mapImage = mapOverviews[mapKey] || emptyMap;

    const containerStyle = {
      backgroundImage: `url(${mapImage})`,
      transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
      transformOrigin: "center",
      transition: followedPlayerId ? "transform 50ms linear" : "transform 0.2s ease",
      cursor: followedPlayerId
        ? "default"
        : zoom > 1
        ? isDragging ? "grabbing" : "grab"
        : "default",
    };

    const playerComponents = [];
    if (this.state.players && this.state.players.length > 0) {
      this.state.players.forEach((p) => {
        playerComponents.push(
          <MapPlayer
            key={p.playerid}
            player={p}
            followed={p.playerid === followedPlayerId}
            onFollow={(id) => this.handleFollow(id)}
          />
        );
      });
    }

    const shots = this.state.shots.map((s, i) =>
      s === null ? null : (
        <MapShot key={i} shot={s} removeCallback={this.removeShot.bind(this)} index={i} />
      )
    );

    const nadeComponents = [];
    if (this.state.nades && this.state.nades.length > 0) {
      this.state.nades.forEach((n) => {
        const team = this.state.nadeTeams[n.id] || "T";
        nadeComponents.push(<MapNade key={n.id} nade={n} team={team} />);
      });
    }

    const nadeExplosions = this.state.nadeExplosions.map((n, i) =>
      n != null && n.id ? (
        <MapNade
          key={n.id}
          nade={n}
          team={n.team || "T"}
          hide={true}
          removeCallback={this.removeNade.bind(this)}
          index={i}
        />
      ) : null
    );

    return (
      <div className="map-wrapper">
        <div
          ref={this.mapRef}
          className="map-container"
          id="map"
          style={containerStyle}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseLeave={this.handleMouseUp}
          onWheel={this.handleWheel}
        >
          {playerComponents}
          {nadeComponents}
          {shots}
          {nadeExplosions}
          <MapBomb
            bomb={this.state.bomb}
            bombPlantedAt={this.state.bombPlantedAt}
            currentRoundtimeSecs={this.state.currentRoundtimeSecs}
          />
        </div>
        <KillFeed messageBus={this.props.messageBus} />
        {followedPlayerName && (
          <div className="follow-badge">
            <span className="follow-badge-dot" />
            {followedPlayerName}
            <button
              className="follow-badge-close"
              onClick={() => this.resetZoom()}
              title="Stop following (Esc)"
            >
              ×
            </button>
          </div>
        )}
        {this.state.hasLower && (
          <button
            className={`map-button layer-toggle${this.state.layer === "_lower" ? " lower-active" : ""}`}
            onClick={this.toggleLayer.bind(this)}
          >
            <div className="layer-icon">⇅</div>
            <div className="layer-hint">Q</div>
          </button>
        )}
        {zoom > 1 && !followedPlayerId && (
          <button className="map-button zoom-reset" onClick={this.resetZoom.bind(this)}>
            <div className="zoom-icon">⌕</div>
            <div className="zoom-hint">W</div>
          </button>
        )}
      </div>
    );
  }
}

export default Map2d;
