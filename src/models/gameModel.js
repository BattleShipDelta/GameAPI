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

gameSchema.methods.orientationHandler = function(o, start, length){
  let columnS = start[0];
  let rowS = start[1];
  let filledSpots = [];
  let longi = columnS;
  let lati = rowS;
  if(o === 'horizontal'){
    if(length > 0){
      for (let i = 0; i<length; i++){
        let coor = lati + longi;
        filledSpots.push(coor);
        longi++;
      }
    } else{
      for (let i=0; i<length; i++){
        let coor = lati + longi;
        filledSpots.push(coor);
        longi--;
      }
    }
  }
  else if( o === 'vertical'){
    if(length > 0){
      for (let i = 0; i<length; i++){
        let coor = lati + longi;
        filledSpots.push(coor);
        lati = lati.charCodeAt(0);
        lati++;
        lati = String.fromCharCode(lati);
      }
    } else{
      for (let i=0; i<length; i++){
        let coor = lati + longi;
        filledSpots.push(coor);
        lati = lati.charCodeAt(0);
        lati--;
        lati = String.fromCharCode(lati);
      }
    }
  }
  return filledSpots;
};

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
  if(start.length !== 2){
    return 'Unrecognized coordinate, try letters a-e and numbers 1-5';
  }
  let targetPlayer = this.players.forEach(target=>{
    if(player === target){
      return target;
    }
  });
  let targetBoard = targetPlayer.board;
  let columnS = start[0];
  let rowS = start[1];
  let columnE = end[0];
  let rowE = end[1];
  if(columnS > 'e' || rowS > 5 || columnE > 'e' || rowE > 5){
    return 'Invalid position given';
  }
  if(columnS !== columnE && rowS !== rowE){
    return 'No diagonal placements allowed';
  }
  if(targetBoard.taken.includes(start) || targetBoard.taken.include(end)){
    return 'One of more of these positions are not available';
  }

  let orientation;
  let shipLength;
  if(columnS === columnE){
    orientation = 'horizontal';
    shipLength = columnS.charCodeAt(0) - columnE.charCodeAt(0);
  } else {
    orientation = 'vertical';
    shipLength = rowS - rowE;
  }
  if(shipLength > 4 || shipLength < 2){
    return 'Invalid ship length';
  }
  let coordinates = this.orientationHandler(orientation, start, shipLength);
  coordinates.forEach(coor =>{
    if(this.targetPlayer.board.taken.includes(coor)){
      return 'One of your coordinates is already taken';
    } else{
      this.targetPlayer.board.taken.push(coor);
    }
  });
  this.targetPlayer.ships.forEach(ship =>{
    if(ship.length === shipLength){
      ship.coordinates = coordinates;
      ship.placed = true;
    }
  });
  return 'Ship placed';
};

gameSchema.methods.phaseChange = function(player, coors){
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
      this.placeShips(player, coors[0], coors[1]);
      let notAllPlaced = player.ships.forEach(ship=>{
        if(!ship.placed){
          return true;
        }
      });
      if(!notAllPlaced){
        this.phase = p[2];
      }
      return this.phase;
    } else {
      this.placeShips(player, coors[0], coors[1]);
      let notAllPlaced = player.ships.forEach(ship=>{
        if(!ship.placed){
          return true;
        }
      });
      if(!notAllPlaced){
        this.phase = p[1];
      }
      return this.phase;
    }
  } else if(this.phase === p[3]){
    this.phase = p[4];
    return this.phase;
  } else if(this.phase === p[4] || this.phase === p[1] || this.phase === p[2]){
    if(this.phase !== p[4]){
      this.placeShips(player, coors[0], coors[1]);
      let notAllPlaced = player.ships.forEach(ship=>{
        if(!ship.placed){
          return true;
        }
      });
      if(!notAllPlaced){
        this.phase = p[3];
      }
    } else{
      this.phase = p[3];
    }
    return this.phase;
  } else if(this.phase === p[5]){
    return 'The game is over. GO AWAY! <3';
  }
};

gameSchema.methods.turnHandler = function(player, ...coors){
  let name = player.name;
  if(name === this.players[0].name || name === this.players[1].name){
    if(player.isTurn !== true){
      return 'Not your turn';
    }
    this.phaseChange(player, coors);
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