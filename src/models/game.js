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
    if (users.length > 2) {
      throw new Error;
    }
    users.forEach(user =>{
      user.board = new Board(user);
      user.ships = {
        'fishingBoat': {
          'length': 2,
          'coordinates': [null, null],
          'health': 2,
          'placed': false,
        },
        'submarine': {
          'length': 3,
          'coordinates': [null, null, null],
          'health': 3,
          'placed': false,
        },
        'battleship': {
          'length': 4,
          'coordinates': [null, null, null, null],
          'health': 4,
          'placed': false,
        },
      };
    });
    this.id = uuid();
    this.turn = 'Both players placing ships';
  }
  playerRestrict(req){
    let conditions = ['Player 1', 'Player 2', 'Both players placing ships', 'Player 1 placing ships', 'Player 2 placing ships'];
    if(this.turn !== 'Game Over'){
      if(this.turn === conditions[0] || this.turn === conditions[1]){
        if(req.body.player === this.turn){
          return 'Not your turn.';
        } else{
          if (this.turn === conditions[0]){
            this.turn = conditions[1];
            return;
          } 
          this.turn = conditions[0];
          return;
        }
      }
      if(this.turn === conditions[2]){
        if(req.body.player === conditions[0]){
          this.turn = conditions[4];
          return;
        }
        if(req.body.player === conditions[1]){
          this.turn = conditions[3];
          return;
        }
      }
      if(this.turn === conditions[3]){
        if(req.body.player === conditions[0]){
          return 'Not your turn';
        }
        this.turn = conditions[0];
        return;
      }
      if(this.turn === conditions[4]){
        if(req.body.player === conditions[1]){
          return 'Not your turn';
        }
        this.turn === conditions[0];
        return;
      }
    }
    return 'This game has ended';
  }
  changeTurn(req){
    

  }
}

module.exports = Game;