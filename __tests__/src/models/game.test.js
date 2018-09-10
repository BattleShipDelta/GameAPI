'use strict';

const Game = require('../../../src/models/game');

describe('game model', ()=> {
  let user1;
  let user2;
  let user3;
  beforeEach(()=>{
    user1 = {};
    user2 = {};
    user3 = {};
  });

  it('can check that each game has 2 users', ()=>{
    let game = new Game(user1, user2);

    expect(game.id).toBeDefined();
    expect(function(){new Game(user1,user2,user3);}).toThrow(Error);
  });
  it('can create a new objects for new game', ()=> {
    let game = new Game(user1, user2);
    console.log(user1.board);

    expect(user1.board).toBeDefined();
    expect(user2.board).toBeDefined();
    expect(user1.board.grid).toBeDefined();

    expect(game.turn).toBe('Both players placing ships');
  });
  it('can create ships for each user', ()=> {
    let game = new Game(user1, user2);
    console.log(game);
    console.log(user1.ships);

    expect(user1.ships).toBeDefined();
  });
});