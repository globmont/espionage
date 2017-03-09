import React, { Component } from 'react';
import './App.css';
import firebase from 'firebase';
import randomstring from 'randomstring'
import _ from 'underscore';
import {Container, List, Segment, Input, Button, Header, Dropdown, Icon} from 'semantic-ui-react';


var userKey = "";
var serverName = "";
window.addEventListener('beforeunload', function() {
    // remove player from active players list
    firebase.database().ref('/servers/' + serverName + '/session/players').child(userKey).remove();
});

const times = [
  {
    text: "10 seconds",
    value: 1/6
  },
  {
    text: "1 minute",
    value: 1
  },
  {
    text: "2 minutes",
    value: 2
  },
  {
    text: "3 minutes",
    value: 3
  },
  {
    text: "5 minutes",
    value: 5
  },
  {
    text: "7 minutes",
    value: 7
  },
  {
    text: "10 minutes",
    value: 10
  }
]


class Game extends Component {

	constructor(props) {
		super(props)
		this.state = {
      lobby: true,
      isSpy: false,
      players: [],
      customLocations: [],
      newLocationValue: "",
      gameLength: 5,
      expiry: 99999999999999999,
      spy: "",
      location: "",
      timeRemaining: "0:00",
      uid: "",
      locations: []
    };

    firebase.initializeApp({
      apiKey: 'AIzaSyDLZBwG2_JKCEncCDLBs1xDn6CY7gLgrjM',
      databaseURL: 'https://spies-52384.firebaseio.com/'
    });

    var that = this;

    this.state.uid = randomstring.generate(20);
    userKey = this.state.uid;
    serverName = this.props.params.serverName.toLowerCase();

    this.dbPlayers = firebase.database().ref('/servers/' + this.props.params.serverName.toLowerCase() + '/session/players');
    this.dbCustomLocations = firebase.database().ref('/servers/' + this.props.params.serverName.toLowerCase() + '/storage/custom_locations');
    this.dbGameLength = firebase.database().ref('/servers/' + this.props.params.serverName.toLowerCase() + '/storage/game_length');
    this.dbSession = firebase.database().ref('/servers/' + this.props.params.serverName.toLowerCase() + '/session');
    this.dbLocations = firebase.database().ref('/locations');

    // add player to list of active players
    var player = {}
    player[this.state.uid] = this.props.location.query.username;
    this.dbPlayers.update(player);

    // handle timer
    setInterval(function() {
      var diff = this.state.expiry - ((new Date()).valueOf());
      diff /= 1000;
      diff = (diff < 0) ? 0 : diff;
      var minutes = Math.floor(diff / 60);
      var seconds = Math.floor(diff % 60);
      this.setState({timeRemaining: minutes + ":" + ((seconds < 10) ? "0" : "") + seconds})
    }.bind(this), 1000);

    // handle db changes
    this.dbPlayers.on('value', function(snapshot) {
      var val = snapshot.val();
      var players = []
      for(var key in val) {
        players.push({header: val[key], key: key})
      }
      that.setState({players: players});
    });
    this.dbCustomLocations.on('value', function(snapshot) {
      var val = snapshot.val();
      var customLocations = []
      for(var i = 0; i < val.length; i++) {
        customLocations.push({header: val[i], key: val[i]})
      }
      that.setState({customLocations: customLocations});
    });
    this.dbGameLength.on('value', function(snapshot) {
      var val = snapshot.val();
      that.setState({gameLength: val});
    });
    this.dbSession.on('value', function(snapshot) {
      var val = snapshot.val();
      var expiry = (!val.expiry) ? 0 : val.expiry;
      that.setState({isSpy: that.state.uid == val.spy, expiry: expiry, location: val.location, lobby: (expiry - (new Date().valueOf()) < 0)});
    });
    this.dbLocations.on('value', function(snapshot) {
      var val = snapshot.val();
      that.setState({locations: val});
    })
	}

  addCustomLocation() {
    var newLocations = [];
    for(var i = 0; i < this.state.customLocations.length; i++)  {
      newLocations.push(this.state.customLocations[i].header)
    }
    newLocations.push(this.state.newLocationValue)
    this.dbCustomLocations.set(newLocations)
    this.setState({newLocationValue: ""})
  }

  setGameLength(val) {
    this.dbGameLength.set(val);
    this.setState({gameLength: val})
  }

  startGame() {
    var players = this.dbPlayers.once('value').then(function(snapshot) {
      var val = snapshot.val();
      var spyUid = Object.keys(val)[Math.floor(Math.random() * ((Object.keys(val).length - 1) - 0 + 1))];


      var customLocations = [];
      for(var i = 0; i < this.state.customLocations.length; i++) {
        customLocations.push(this.state.customLocations[i].header);
      }
      var allLocations = _.union(customLocations, this.state.locations);
      var location = allLocations[Math.floor(Math.random() * ((allLocations.length - 1) - 0 + 1))];

      this.dbSession.update({location: location, spy: spyUid, expiry: new Date().valueOf() + this.state.gameLength * 60000});
      this.setState({lobby: false});

    }.bind(this));
  }


  endGame() {
    this.setState({lobby: true});
    this.dbSession.update({expiry: new Date().valueOf() - 1000});
  }


  getTimeRemaining() {
    var now = new Date().valueOf();

  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Espionage</h1>
          <h2>{this.props.params.serverName}</h2>
        </div>

        <Container text className="App-content">
        	{this.state.lobby &&
            <Segment.Group>
        			<Segment.Group horizontal>
		        		<Segment attached>
		        			<h3 className="subtitle">Players</h3>
                  <Segment color="red">
                    <List divided relaxed items={this.state.players} />
                  </Segment>
		          	</Segment>
		          	<Segment attached>
			          	<h3 className="subtitle">Custom Locations</h3>
                  <Segment color="blue">
  			          	<List divided relaxed items={this.state.customLocations} />
                    <Input action={<Button icon="add" onClick={this.addCustomLocation.bind(this)} color="blue" />} value={this.state.newLocationValue} onChange={(event, data) => {this.setState({newLocationValue: data.value})}} placeholder='Add a location...' />
                  </Segment>
						    </Segment>
					    </Segment.Group>
              <Segment>
                <h3 className="subtitle">Server Settings</h3>
                <Dropdown labeled placeholder='Select game length' value={this.state.gameLength} onChange={(event, data) => {this.setGameLength(data.value)}} selection options={times} />
              </Segment>
              <Segment>
                <Button positive onClick={this.startGame.bind(this)}>Start game</Button>
              </Segment>
            </Segment.Group>
        	}

        	{!this.state.lobby &&
        		<Segment.Group>
              <Header size="huge" color="blue" attached="top"><Icon name="time" />{this.state.timeRemaining}</Header>
              <Segment attached>
                <h3>You <span className={(this.state.isSpy) ? "green" : "red"}>{(this.state.isSpy) ? "are" : "are not"}</span> the spy.</h3>
                {!this.state.isSpy &&
                  <h3>The location is: <span className="blue">{this.state.location}</span></h3>
                }
              </Segment>
              <Segment attached>
                <h3 className="subtitle">Possible Locations</h3>
                <List animated relaxed items={_.union(this.state.customLocations, this.state.locations)} />
              </Segment>
              <Segment attached>
                <h3 className="subtitle">Actions</h3>
                <Button negative onClick={this.endGame.bind(this)}>End game</Button>
              </Segment>
        		</Segment.Group>
        	}
        </Container>
      </div>
    );
  }
}

export default Game;
