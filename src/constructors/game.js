'use strict';

// import mongoose, {Schema} from 'mongoose';
// import Model from '../models/gameModel';
// import uuid from 'uuid';

class Board{
  constructor(player){
    this.id = player.name;
    this.grid = {
      'a': [1,2,3,4,5],
      'b': [1,2,3,4,5],
      'c': [1,2,3,4,5],
      'd': [1,2,3,4,5],
      'e': [1,2,3,4,5],
    };
    this.ships = null;
    this.shotAt = [];
    this.taken = [];
  }
}

class Player{
  constructor(user){
    this.name = user;
    this.ships = [
      {
        'shipType': 'SS. ETHAN',
        'length': 2,
        'coordinates': [null, null],
        'health': 2,
        'placed': false,
      },
      {
        'shipType': 'Submarine',
        'length': 3,
        'coordinates': [null, null, null],
        'health': 3,
        'placed': false,
      },
      {
        'shipType': 'Battleship',
        'length': 4,
        'coordinates': [null, null, null, null],
        'health': 4,
        'placed': false,
      },
    ];
    this.board = new Board(this);
    this.isTurn = true;
  }
}

module.exports = Player;