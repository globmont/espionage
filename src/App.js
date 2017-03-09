import React, { Component } from 'react';
import './App.css';
import {browserHistory} from 'react-router';
import {Form, Container, Segment} from 'semantic-ui-react';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {username: "", serverName: ""};
  }

  joinGame() {
    browserHistory.push('/game/' + this.state.serverName + '?username=' + this.state.username);
  }


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Espionage</h1>
        </div>

        <Container text className="App-content">
          <Segment>
            <h3>Enter a username and server name to join</h3>
            <Form>
              <Form.Input icon="user" value={this.state.username} onChange={(event, data) => {this.setState({username: data.value})}} iconPosition="left" placeholder="Username" required/>
              <Form.Input icon="server" value={this.state.serverName} onChange={(event, data) => {this.setState({serverName: data.value})}} iconPosition="left" placeholder="Server name" required/>
              <Form.Button type="submit" onClick={this.joinGame.bind(this)} positive>Join Game</Form.Button>
            </Form>
          </Segment>
        </Container>
      </div>
    );
  }
}

export default App;
