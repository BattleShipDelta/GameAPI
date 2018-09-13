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

gameSchema.methods.checkStatus = function(user){
  let isPlayer;
  let target;
  this.players.forEach(player =>{
    if(String(user.name) === player.name){
      isPlayer = true;
      target = player;
    }
  });
  if(isPlayer){
    let shipStatuses = [];
    target.ships.forEach(ship=>{
      shipStatuses.push({
        'name': ship.shipType,
        'health': ship.health,
        'placed': ship.placed,
        'coordinates': ship.coordinates,
      });
    });
    return {
      'phase': this.phase,
      'shipStatuses': shipStatuses,
      'yourTurn': target.isTurn,
      'shotAt': target.board.shotAt,
    };
  } else return {'phase': this.phase};
};

gameSchema.methods.gameOverCheck = function(player){
  let conditions = [];
  player.ships.forEach(ship =>{
    if(ship.health === 0){
      conditions.push(1);
    }
  });
  if(conditions.length === 3){
    this.phase = '5: Game Over';
    return `${player.name} lost`;
  }
};

gameSchema.methods.shoot = function(player, target, coor){
  let p = [
    '0: Both players placing ships',
    '1: Player 1 placing ships',
    '2: Player 2 placing ships',
  ];
  if((p.includes(this.phase))){
    throw new Error('Both players are not ready to play yet');
  }
  let col = coor[0];
  let row = coor[1];

  if(typeof coor !== 'string' || coor.length !== 2 || 'a'>col || col>'e' || 1>row || row>5){
    throw new Error('Unrecognized coordinate');
  }
  if(player.board.shotAt.includes(coor)){
    throw new Error('You shot this spot already');
  }
  player.board.shotAt.push(coor);
  if(target.board.taken.includes(coor)){
    let sunk;
    target.ships.forEach(ship =>{
      let hit;
      ship.coordinates.forEach(coordinate =>{
        if (coordinate === coor){
          console.log('hit');
          hit = true;
        }
      });
      if(hit){
        ship.health--;
        if(ship.health <= 0){
          sunk = true;
        }
      }
    });
    if(sunk){
      return 'A ship was sunk';
    } else return `${coor} was a hit`;
  } else return `${coor} was a miss`;
};

gameSchema.methods.orientationHandler = function(o, start, length){
  let columnS = start[0];
  let rowS = start[1];
  let filledSpots = [];
  let longi = columnS;
  let lati = rowS;
  if(o === 'horizontal'){
    if(length > 0){
      for (let i = 0; i<length; i++){
        let coor = longi + lati;
        filledSpots.push(coor);
        lati--;
      }
    } else{
      for (let i=0; i>length; i--){
        let coor = longi + lati;
        filledSpots.push(coor);
        lati++;
      }
    }
  }
  else if( o === 'vertical'){
    if(length > 0){
      for (let i = 0; i<length; i++){
        let coor = longi + lati;
        filledSpots.push(coor);
        longi = longi.charCodeAt(0);
        longi--;
        longi = String.fromCharCode(longi);
      }
    } else{
      for (let i=0; i>length; i--){
        let coor = longi + lati;
        filledSpots.push(coor);
        longi = longi.charCodeAt(0);
        longi++;
        longi = String.fromCharCode(longi);
      }
    }
  }
  return filledSpots;
};

gameSchema.methods.placeShips = function(player, start, end){
  if(!start || !end){
    throw new Error('No coordinates defined');
  }
  if(typeof start !== 'string' || typeof end !== 'string'){
    throw new Error('Cannot read coordinates. Coordinates must be strings.');
  }
  let p = [
    '0: Both players placing ships',
    '1: Player 1 placing ships',
    '2: Player 2 placing ships',
  ];
  if(!(p.includes(this.phase))){
    throw new Error('Ships have already been placed');
  }
  if(start.length !== 2 || end.length !== 2){
    throw new Error('Unrecognized coordinate, try letters a-e and numbers 1-5');
  }
  let targetPlayer; 
  this.players.forEach(target=>{
    if(player === target){
      targetPlayer = target;
    }
  });
  let targetBoard = targetPlayer.board;
  // column is the letter that we find in the board's grid, row is the number in that column
  let columnS = start[0];
  let rowS = start[1];
  let columnE = end[0];
  let rowE = end[1];
  if('a'> columnS || columnS > 'e' || 1 > rowS || rowS > 5 || 'a'>columnE || columnE > 'e' || 1>rowE || rowE > 5){
    throw new Error('Invalid position given');
  }
  if(columnS !== columnE && rowS !== rowE){
    throw new Error('No diagonal placements allowed');
  }
  let taken = targetBoard.taken;
  if(taken.includes(start) || taken.includes(end)){
    throw new Error('One of more of these positions are not available');
  }

  let orientation;
  let shipLength;
  if(columnS === columnE){
    orientation = 'horizontal';
    shipLength = rowS - rowE;
  } else {
    orientation = 'vertical';
    shipLength = columnS.charCodeAt(0) - columnE.charCodeAt(0);
  }
  if(shipLength>0){
    shipLength++;
  }
  if(shipLength<0){
    shipLength--;
  }
  if((shipLength > 4 || shipLength < 2) && (shipLength< -4 || shipLength > -2)){
    throw new Error('Ship length invalid');
  }
  let coordinates = this.orientationHandler(orientation, start, shipLength);
  coordinates.forEach(coor =>{
    if(taken.includes(coor)){
      throw new Error('One or more of your coordinates is already taken');
    } else{
      taken.push(coor);
    }
  });
  shipLength = Math.sqrt(Math.pow(shipLength, 2));
  targetPlayer.ships.forEach(ship =>{
    if(ship.length === shipLength){
      if(ship.placed){
        throw new Error(`Your ship of length ${shipLength} has already been placed`);
      }
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
    let result = this.placeShips(player, coors[0], coors[1]);
    let notAllPlaced;
    player.ships.forEach(ship=>{
      if(!ship.placed){
        notAllPlaced = true;
      }
    });
    if(!notAllPlaced){
      if(player === this.players[0]){
        this.phase = p[2];
      } else{
        this.phase = p[1];
      }
    }
    return (`${result} | ${this.phase}`);
  }
  else if(this.phase === p[3]){
    let target = this.players[1];
    let current = this.players[0];
    let result = this.shoot(current, target, coors[0]);
    this.phase = p[4];
    if(result === 'A ship was sunk'){
      let query = this.gameOverCheck(target);
      if(query){
        result = query;
      }
    }
    return (`${result} | ${this.phase}`);
  } else if(this.phase === p[4] || this.phase === p[1] || this.phase === p[2]){
    let result;
    if(this.phase !== p[4]){
      result = this.placeShips(player, coors[0], coors[1]);
      let notAllPlaced;
      player.ships.forEach(ship=>{
        if(!ship.placed){
          notAllPlaced = true;
        }
      });
      if(!notAllPlaced){
        this.phase = p[3];
      }
    } else{
      let target = this.players[0];
      let current = this.players[1];
      let result = this.shoot(current, target, coors[0]);
      this.phase = p[3];
      if(result === 'A ship was sunk'){
        let query = this.gameOverCheck(target);
        if(query){
          result = query;
        }
      }
      return(`${result} | ${this.phase}`);
    }
    return (`${result} | ${this.phase}`);
  } else if(this.phase === p[5]){
    return 'The game is over. GO AWAY! <3';
  }
};

gameSchema.methods.turnHandler = function(player, ...coors){
  let result;
  if(!player){
    throw new Error('Player not defined');
  }
  let name = player.name;
  if(name === this.players[0].name || name === this.players[1].name){
    if(player.isTurn !== true){
      throw new Error('Not your turn');
    }
    result = this.phaseChange(player, coors);
    let p = [
      '0: Both players placing ships',
      '1: Player 1 placing ships',
      '2: Player 2 placing ships',
      '3: Player 1s turn',
      '4: Player 2s turn',
      '5: Game Over',
    ];
    if(this.phase === p[0]){
      this.players.forEach(player => player.isTurn = true);
    }
    if(this.phase === p[1] || this.phase === p[3]){
      this.players[0].isTurn = true;
      this.players[1].isTurn = false;
    }
    if(this.phase === p[2] || this.phase === p[4]){
      this.players[0].isTurn = false;
      this.players[1].isTurn = true;
    }
    return ( `${result} | ${player.name}'s turn was processed.`);
  }
  else{
    throw new Error('You are not a part of this game');
  }
};


const Game = mongoose.model('game', gameSchema, 'game');

Game.route = 'game';

export default Game;