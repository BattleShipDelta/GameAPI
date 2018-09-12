'use strict';

import mongoose, {Schema} from 'mongoose';

const shipSchema = Schema({
  shipType: String,
  length: Number,
  coordinates: [String],
  health: Number,
  placed: Boolean,
});

const gridSchema = Schema({
  a: {type: [Number], required: true, default: [1,2,3,4,5]},
  b: {type: [Number], required: true, default: [1,2,3,4,5]},
  c: {type: [Number], required: true, default: [1,2,3,4,5]},
  d: {type: [Number], required: true, default: [1,2,3,4,5]},
  e: {type: [Number], required: true, default: [1,2,3,4,5]},
});

const boardSchema = Schema({
  grid: {type: gridSchema},
  taken: [],
  shotAt: {type: [String], required: true, default: []},
  ships: {
    type: [shipSchema],
  },
});

const playerSchema = Schema({
  name: String,
  board: boardSchema,
  ships: {
    type: [shipSchema],
  },
  isTurn: Boolean, 
});

const gameSchema = Schema({
  players: { type: [playerSchema],
    validate: [arrayLimit, '{PATH} does not contain the limit of 2.']},
  phase: { type: String, required: true, default: '0: Both players placing ships'},
});

function arrayLimit(val) {
  console.log(val.length);
  return val.length === 2;
}

// gameSchema.methods.shoot = function(coors){
//   let p = [
//     '0: Both players placing ships',
//     '1: Player 1 placing ships',
//     '2: Player 2 placing ships',
//   ];

//   if(p.includes(this.phase)){
//     return 'Both players are not ready to play yet';
//   }

// }

gameSchema.methods.placeShips = function(player, start, end){
  let p = [
    '0: Both players placing ships',
    '1: Player 1 placing ships',
    '2: Player 2 placing ships',
  ];
  if(!(p.includes(this.phase))){
    return 'Ships have already been placed';
  }
  if(!start){
    return 'Please include coordinates for your ship';
  }
  if(start.length !== 2 ||){
    return 'Unrecognized coordinate, try letters a-e and numbers 1-5';
  }
}

gameSchema.methods.phaseChange = function(player){
  let p = [
    '0: Both players placing ships',
    '1: Player 1 placing ships',
    '2: Player 2 placing ships',
    '3: Player 1s turn',
    '4: Player 2s turn',
    '5: Game Over',
  ];
  if(this.phase === p[0]){
    if(player === this.players[0]){
      this.phase = p[2];
      return this.phase;
    } else {
      this.phase = p[1];
      return this.phase;
    }
  } else if(this.phase === p[3]){
    this.phase = p[4];
    return this.phase;
  } else if(this.phase === p[4] || this.phase === p[1] || this.phase === p[2]){
    this.phase = p[3];
    return this.phase;
  } else if(this.phase === p[5]){
    return 'The game is over. GO AWAY! <3';
  }
};

gameSchema.methods.turnHandler = function(player){
  let name = player.name;
  if(name === this.players[0].name || name === this.players[1].name){
    if(player.isTurn !== true){
      return 'Not your turn';
    }
    this.phaseChange(player);
    this.players.forEach(player => {
      if(player.name === name){
        player.isTurn = false;
      }else{
        player.isTurn = true;
      }
    });
  }
  return `${player.name}'s turn was changed.`;
};


const Game = mongoose.model('game', gameSchema, 'game');

Game.route = 'game';

export default Game;