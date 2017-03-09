import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Game from './Game'
import './index.css';
import { Router, Route, hashHistory } from 'react-router'


ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}></Route>
    <Route path="game/:serverName" component={Game}></Route>
  </Router>,
  document.getElementById('root')
);
