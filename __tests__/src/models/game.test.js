'use strict';
import Game from '../../../src/models/gameModel';
const Player = require('../../../src/constructors/game');
const mongoConnect = require('../../../src/util/mongo-connect');

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb://localhost/401-2018-instruments';

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
    let testGame2 = new Game({
      players: [player1, player2, player3],
    });
    console.log(testGame2);

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
    console.log(game.players[0].board.ships);
    expect(game.players[0].ships.length).toBe(3);
    expect(game.players[0].ships[0].shipType).toBe('SS. ETHAN');
    //expect(game.players[0].board.ships.length).toBe(3);

    expect(game.phase).toBe('0: Both players placing ships');
  });
  it('can change its turn/phase', ()=>{
    let game = new Game({
      players: [player1, player2],
    });
    console.log(game);
    game.turnHandler(game.players[0]);
    expect(game.players[0].isTurn).toBe(false);
    expect(game.players[1].isTurn).toBe(true);
    expect(game.turnHandler(game.players[0])).toBe('Not your turn');
    expect(game.phase).toBe('2: Player 2 placing ships');
    game.turnHandler(game.players[1]);
    expect(game.phase).toBe('3: Player 1s turn');
    expect(game.players[1].isTurn).toBe(false);

  });
});