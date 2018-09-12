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

    expect(game.phase).toBe('Both players placing ships');
  });
  it('can create ships for each user', ()=> {
    let game = new Game({
      players: [player1, player2],
    });
    console.log(game);
    console.log(game.players[0].ships);

    expect(game.players[0].ships).toBeDefined();
  });
  describe('Players',()=>{
    var game;
    beforeEach(()=>{
      game = new Game(user1, user2);
    });
    it('creates a new player for each user', ()=>{
      expect(game.players.length).toBe(2);
      let player1 = game.players[0];
      let player2 = game.players[1];
      expect(player1.name).toBe(1);
      expect(player2.name).toBe(2);
      expect(player1.isTurn).toBe(true);
      expect(player2.isTurn).toBe(true);
    });
    it('has properties filled by the game', ()=>{
      expect(game.players[0].ships).not.toBe(null);
    });
  });
  describe('Turn Handler',()=>{
    var game;
    var player1;
    var player2;
    beforeEach(()=>{
      game = new Game(user1, user2);
      player1 = game.players[0];
      player2 = game.players[1];
    });
    it('can change the turn status of a player', ()=>{
      expect(game.turnHandler2(player1)).toBe('1\'s turn was changed.');
      expect(player1.isTurn).toBe(false);
      expect(player2.isTurn).toBe(true);
      game.turnHandler2(player2);
      expect(player2.isTurn).toBe(false);
      expect(player1.isTurn).toBe(true);
    });
  });
});