import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Game from './Game'
import './index.css';
import { Router, Route, browserHistory } from 'react-router'


ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}></Route>
    <Route path="game/:serverName" component={Game}></Route>
  </Router>,
  document.getElementById('root')
);
