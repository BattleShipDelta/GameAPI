'use strict';
import Game from '../../../src/models/gameModel';
const Player = require('../../../src/constructors/game');
const mongoConnect = require('../../../src/util/mongo-connect');

const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI);

describe('game model', ()=> {
  let user1;
  let user2;
  let user3;
  let player1;
  let player2;
  let player3;
  beforeEach(()=>{
    user1 = {'name':1};
    user2 = {'name':2};
    user3 = {'name':3};
    player1 = new Player(user1);
    player2 = new Player(user2);
    player3 = new Player(user3);
    return mongoConnect(MONGODB_URI);
  });

  it('can check that each game has 2 users', ()=>{
    let testGame = new Game({
      players: [player1, player2],
    });
    console.log(testGame.players[0].isTurn);
    console.log(testGame);
    expect(testGame._id).toBeDefined();

    return expect(new Game({
      players: [player1, player2, player3],
    }).validate())
      .rejects.toThrow(Error);
  });
  it('can create a new objects for new game', ()=> {
    let game = new Game({
      players: [player1, player2],
    });
    console.log(game.players[0].board);

    expect(game.players[0].board).toBeDefined();
    expect(game.players[1].board).toBeDefined();
    expect(game.players[0].board.grid).toBeDefined();
    expect(game.players[0].board.ships).toBeDefined();
    expect(game.players[0].board.grid.a).toBeDefined();
    expect(game.players[0].ships.length).toBe(3);
    expect(game.players[0].ships[0].shipType).toBe('SS. ETHAN');

    expect(game.phase).toBe('0: Both players placing ships');
  });
  it('can change its turn/phase', ()=>{
    let game = new Game({
      players: [player1, player2],
    });
    console.log(game);

    //Placing ships at start of game
    game.turnHandler(game.players[0], 'a4', 'a1');
    expect(game.players[0].ships[2].placed).toBe(true);
    expect(game.players[0].ships[2].coordinates).toContain('a4','a3','a2', 'a1');
    expect(function(){
      game.turnHandler(game.players[0], 'z1142', 'z4');
    }).toThrow(Error);
    game.turnHandler(game.players[0], 'c1', 'b1');
    expect(game.players[0].ships[0].placed).toBe(true);
    console.log(game.players[0].ships[0].coordinates[1]);
    game.turnHandler(game.players[0], 'c2', 'e2');
    expect(game.players[0].ships[1].coordinates).toContain('c2','d2','e2');
    expect(game.players[0].isTurn).toBe(false);
    expect(game.phase).toBe('2: Player 2 placing ships');
    expect(game.players[0].board.taken).toContain('a4', 'a3', 'a2', 'a1', 'c1', 'b1', 'c2', 'd2', 'e2');
    expect(game.players[1].isTurn).toBe(true);
    game.turnHandler(game.players[1], 'a4', 'a1');
    game.turnHandler(game.players[1], 'c1', 'b1');
    game.turnHandler(game.players[1], 'c2', 'e2');
    expect(game.players[1].isTurn).toBe(false);
    expect(game.phase).toBe('3: Player 1s turn');
    expect(game.players[0].isTurn).toBe(true);

    //Shooting stuff
    expect(game.turnHandler(game.players[0], 'e4')).toBe('e4 was a miss | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.players[0].board.shotAt).toContain('e4');
    game.turnHandler(game.players[1], 'a1');
    expect(game.players[0].ships[2].health).toBe(3);

  });
});

// expect(function(){
//   game.turnHandler(game.players[0], 'z1142', 'z4');
// }).toThrow(Error);