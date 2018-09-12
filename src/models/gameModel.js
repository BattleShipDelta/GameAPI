'use strict';

import mongoose, {Schema} from 'mongoose';
const Player = require('../constructors/game');

const gridSchema = Schema({
  a: {type: [Number], required: true, default: [1,2,3,4,5]},
  b: {type: [Number], required: true, default: [1,2,3,4,5]},
  c: {type: [Number], required: true, default: [1,2,3,4,5]},
  d: {type: [Number], required: true, default: [1,2,3,4,5]},
  e: {type: [Number], required: true, default: [1,2,3,4,5]},
});

const boardSchema = Schema({
  grid: {type: gridSchema},
  shotAt: {type: [String], required: true, default: []},
});

const playerSchema = Schema({
  name: String,
  board: boardSchema,
});

const gameSchema = Schema({
  players: { type: [playerSchema],
    validate: [arrayLimit, '{PATH} does not contain the limit of 2.']},
  phase: { type: String, required: true, default: 'Both players placing ships'},
});

function arrayLimit(val) {
  console.log(val.length);
  return val.length === 2;
}

const Game = mongoose.models.game || mongoose.model('game', gameSchema, 'game');

gameSchema.methods.turnHandler2 = function(player){
  let name = player.name;
  if(player.name === this.players[0].name || player.name === this.players[1].name){
    if(player.isTurn !== true){
      return 'Not your turn';
    }
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

Game.route = 'game';

export default Game;