'use strict';

import uuid from 'uuid';

class Board{
  constructor(user){
    this.id = user.id;
    this.grid = {
      'a': [1,2,3,4,5],
      'b': [1,2,3,4,5],
      'c': [1,2,3,4,5],
      'd': [1,2,3,4,5],
      'e': [1,2,3,4,5],
    };
    this.ships = null;
    this.shotAt = [];
  }
}

class Game{
  constructor(...users){
    users.forEach(user =>{
      user.board = new Board(user);
      user.ships = {
        'fishingBoat': {
          'length': 2,
          'coordinates': [null, null],
          'health': 2,
        },
        'submarine': {
          'length': 3,
          'coordinates': [null, null, null],
          'health': 3,
        },
        'battleship': {
          'length': 4,
          'coordinates': [null, null, null, null],
          'health': 4,
        },
      };
    });
    this.id = uuid();
    this.turn = 'Both players placing ships';
  }
}

module.exports = Game;