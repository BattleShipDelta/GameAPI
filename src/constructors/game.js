'use strict';

import mongoose, {Schema} from 'mongoose';
import Model from '../models/gameModel';
import uuid from 'uuid';

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
    this.name = user.name;
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

// class Game{
//   constructor(...users){
//     if (users.length > 2) {
//       throw new Error;
//     }
//     this.players = [];
//     users.forEach(user =>{
//       this.players.push(new Player(user));
//     });
//     this.players.forEach(player =>{
//       player.board = new Board(player);
//       player.ships = {
//         'fishingBoat': {
//           'length': 2,
//           'coordinates': [null, null],
//           'health': 2,
//           'placed': false,
//         },
//         'submarine': {
//           'length': 3,
//           'coordinates': [null, null, null],
//           'health': 3,
//           'placed': false,
//         },
//         'battleship': {
//           'length': 4,
//           'coordinates': [null, null, null, null],
//           'health': 4,
//           'placed': false,
//         },
//       };
//     });
//     this.id = uuid();
//     this.turn = 'Both players placing ships';
//   }
//   // Might not use this one, use option 2 for now
//   turnHandler(req){
//     let conditions = ['Player 1', 'Player 2', 'Both players placing ships', 'Player 1 placing ships', 'Player 2 placing ships'];
//     if(this.turn !== 'Game Over'){
//       if(this.turn === conditions[0] || this.turn === conditions[1]){
//         if(req.body.player === this.turn){
//           return 'Not your turn.';
//         } else{
//           if (this.turn === conditions[0]){
//             this.turn = conditions[1];
//             return;
//           } 
//           this.turn = conditions[0];
//           return;
//         }
//       }
//       if(this.turn === conditions[2]){
//         if(req.body.player === conditions[0]){
//           this.turn = conditions[4];
//           return;
//         }
//         if(req.body.player === conditions[1]){
//           this.turn = conditions[3];
//           return;
//         }
//       }
//       if(this.turn === conditions[3]){
//         if(req.body.player === conditions[0]){
//           return 'Not your turn';
//         }
//         this.turn = conditions[0];
//         return;
//       }
//       if(this.turn === conditions[4]){
//         if(req.body.player === conditions[1]){
//           return 'Not your turn';
//         }
//         this.turn === conditions[0];
//         return;
//       }
//     }
//     return 'This game has ended';
//   }
//   //use this option for now
//   turnHandler2(player){
//     let name = player.name;
//     if(player.name === this.players[0].name || player.name === this.players[1].name){
//       if(player.isTurn !== true){
//         return 'Not your turn';
//       }
//       this.players.forEach(player => {
//         if(player.name === name){
//           player.isTurn = false;
//         }else{
//           player.isTurn = true;
//         }
//       });
//     }
//     return `${player.name}'s turn was changed.`;
//   }
//   save(){
//     let game = new Model({
//       players: this.players,
//       id: this.id,
//       turn: this.turn,
//     });

//   }
// }

// const gameSchema = Schema({
//   players: { type: Object, required: true},
//   id: { type: String, required: true},
//   turn: { type: String, required: true},
// });

// const Game = mongoose.models.game || mongoose.models('game', gameSchema, 'game');

// Game.route = 'game';

// export default Game;

// })
//   constructor(...users){
//     if (users.length > 2) {
//       throw new Error;
//     }
//     this.players = [];
//     users.forEach(user =>{
//       this.players.push(new Player(user));
//     });
//     this.players.forEach(player =>{
//       player.board = new Board(player);
//       player.ships = {
//         'fishingBoat': {
//           'length': 2,
//           'coordinates': [null, null],
//           'health': 2,
//           'placed': false,
//         },
//         'submarine': {
//           'length': 3,
//           'coordinates': [null, null, null],
//           'health': 3,
//           'placed': false,
//         },
//         'battleship': {
//           'length': 4,
//           'coordinates': [null, null, null, null],
//           'health': 4,
//           'placed': false,
//         },
//       };
//     });
//     this.id = uuid();
//     this.turn = 'Both players placing ships';
//   }
//   // Might not use this one, use option 2 for now
//   turnHandler(req){
//     let conditions = ['Player 1', 'Player 2', 'Both players placing ships', 'Player 1 placing ships', 'Player 2 placing ships'];
//     if(this.turn !== 'Game Over'){
//       if(this.turn === conditions[0] || this.turn === conditions[1]){
//         if(req.body.player === this.turn){
//           return 'Not your turn.';
//         } else{
//           if (this.turn === conditions[0]){
//             this.turn = conditions[1];
//             return;
//           } 
//           this.turn = conditions[0];
//           return;
//         }
//       }
//       if(this.turn === conditions[2]){
//         if(req.body.player === conditions[0]){
//           this.turn = conditions[4];
//           return;
//         }
//         if(req.body.player === conditions[1]){
//           this.turn = conditions[3];
//           return;
//         }
//       }
//       if(this.turn === conditions[3]){
//         if(req.body.player === conditions[0]){
//           return 'Not your turn';
//         }
//         this.turn = conditions[0];
//         return;
//       }
//       if(this.turn === conditions[4]){
//         if(req.body.player === conditions[1]){
//           return 'Not your turn';
//         }
//         this.turn === conditions[0];
//         return;
//       }
//     }
//     return 'This game has ended';
//   }
//   //use this option for now
//   turnHandler2(player){
//     let name = player.name;
//     if(player.name === this.players[0].name || player.name === this.players[1].name){
//       if(player.isTurn !== true){
//         return 'Not your turn';
//       }
//       this.players.forEach(player => {
//         if(player.name === name){
//           player.isTurn = false;
//         }else{
//           player.isTurn = true;
//         }
//       });
//     }
//     return `${player.name}'s turn was changed.`;
//   }
//   save(){
//     let game = new Model({
//       players: this.players,
//       id: this.id,
//       turn: this.turn,
//     });

//   }
// }

module.exports = Player;