'use strict';
import Game from '../../src/models/gameModel';
const Player = require('../../src/constructors/game');
const mongoConnect = require('../../src/util/mongo-connect');

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
    user1 = '1';
    user2 = '2';
    user3 = '3';
    player1 = new Player(user1);
    player2 = new Player(user2);
    player3 = new Player(user3);
    return mongoConnect(MONGODB_URI);
  });

  it('can check that each game has 2 users', ()=>{
    let testGame = new Game({
      players: [player1, player2],
    });
    //console.log(testGame.players[0].isTurn);
    //console.log(testGame);
    expect(testGame._id).toBeDefined();

    let testGame2 = new Game({
      players: [player1, player2, player3],
    });
    //console.log(testGame2);


    return expect(new Game({
      players: [player1, player2, player3],
    }).validate())
      .rejects.toThrow(Error);
  });
  it('can create a new objects for new game', ()=> {
    let game = new Game({
      players: [player1, player2],
    });
    //console.log(game.players[0].board);

    expect(game.players[0].board).toBeDefined();
    expect(game.players[1].board).toBeDefined();
    expect(game.players[0].board.grid).toBeDefined();
    expect(game.players[0].board.ships).toBeDefined();
    expect(game.players[0].board.grid.a).toBeDefined();
    expect(game.players[0].ships.length).toBe(3);
    expect(game.players[0].ships[0].shipType).toBe('SS. ETHAN');

    expect(game.phase).toBe('0: Both players placing ships');
  });

  it('Player ONE, takes turn', ()=>{
    let game = new Game({
      players: [player1, player2],
    });
    // console.log(game);
    //  phase = '0: Both players placing ships',
    //  phase = '1: Player 1 placing ships',
    //Placing ships at start of game player ONE test for turn ONE W/(2 length ship)VER
    game.turnHandler(game.players[0], 'c1', 'b1');
    expect(game.players[0].ships[0].placed).toBe(true);
    console.log(game.players[0].ships[0].coordinates[1]);
    //Player ONE test for turn ONE W/(3 length ship)VER
    game.turnHandler(game.players[0], 'c2', 'e2');
    expect(game.players[0].ships[1].coordinates).toContain('c2','d2','e2');
    //Placing ships at start of game player ONE test for turn W/(4 length ship)HOR
    game.turnHandler(game.players[0], 'a4', 'a1');
    expect(game.players[0].ships[2].placed).toBe(true);
    expect(game.players[0].ships[2].coordinates).toContain('a4','a3','a2', 'a1');
    //check player one to have Horizontal four piece ship, Vertical two piece ship and a horizontal three piece.
    expect(game.players[0].board.taken).toContain('a4', 'a3', 'a2', 'a1', 'c1', 'b1', 'c2', 'd2', 'e2');

    //Player One enters an incorrect coor. and program responds
    expect(function(){
      game.turnHandler(game.players[0], 'z1142', 'z4');
    }).toThrow(Error);
    //TURN STATUS Over for Player ONE
    expect(game.players[0].isTurn).toBe(false);
    //PHASE STATUS for game turn. 
    expect(game.phase).toBe('2: Player 2 placing ships');
    //Check for turn Status now that player one is done. Player two turn should be true.
    expect(game.players[1].isTurn).toBe(true);
    
    // //Player Two takes turn.
    // game.turnHandler(game.players[1], 'a4', 'a1');
    // game.turnHandler(game.players[1], 'c1', 'b1');
    // game.turnHandler(game.players[1], 'c2', 'e2');
    // //Player Two turn over. 
    // expect(game.players[1].isTurn).toBe(false);
    // //Phase check post Players first turns. 
    // expect(game.phase).toBe('3: Player 1s turn');
    // expect(game.players[0].isTurn).toBe(true);

    //Shooting stuff
    // expect(game.turnHandler(game.players[0], 'e4')).toBe('e4 was a miss | 4: Player 2s turn | 1\'s turn was processed.');
    // expect(game.players[0].board.shotAt).toContain('e4');
    // game.turnHandler(game.players[1], 'a1');
    // expect(game.players[0].ships[2].health).toBe(3);   
  });

  it('Player TWO takes turn.)', ()=>{
    let game = new Game({
      players: [player1, player2],
    });
    //playone places Peices.
    game.turnHandler(game.players[0], 'c1', 'b1');
    game.turnHandler(game.players[0], 'c2', 'e2');
    game.turnHandler(game.players[0], 'a4', 'a1');
    expect(game.players[0].isTurn).toBe(false);
    //console.log('Player Two testing ' + game);

    //  phase = '0: Both players placing ships',
    //  phase = '1: Player 2 placing ships',
    //Placing ships at start of game player Two test for turn ONE W/(2 length ship)VER
    game.turnHandler(game.players[1], 'c5', 'b5');
    expect(game.players[1].ships[0].placed).toBe(true);
    //console.log(game.players[1].ships[0].coordinates[0]);

    //Player ONE test for turn Two W/(3 length ship)VER
    game.turnHandler(game.players[1], 'c4', 'e4');
    expect(game.players[1].ships[1].coordinates).toContain('c4','d4','e4');

    // //Placing ships at start of game player Two test for turn W/(4 length ship)VER
    game.turnHandler(game.players[1], 'b3', 'e3');
    expect(game.players[1].ships[2].placed).toBe(true);
    expect(game.players[1].ships[2].coordinates).toContain('b3','c3','d3', 'e3');

    //check player Two to have VERT four piece ship, Vertical two piece ship and a VERT three piece.
    expect(game.players[1].board.taken).toContain('b3','c3','d3', 'e3','c4','d4','e4','c5', 'b5');
    //Current GAME Board set up
    // a    [x,x,x,x,5]   x is player 1
    // b:   [x,2,o,4,o]   o is player 2
    // c:   [x,x,0,0,o]
    // d:   [1,x,0,0,5]
    // e    [1,x,0,0,5]
    //Player One enters an incorrect coor. and program responds
    expect(function(){
      game.turnHandler(game.players[1], 'z1942', 'z4');
    }).toThrow(Error);
    //TURN STATUS Over for Player ONE
    expect(game.players[1].isTurn).toBe(false);
  });

  it('Player ONE and TWO, go through PHASES', ()=>{
    let game = new Game({
      players: [player1, player2],
    });
    //  phase = '0: Both players placing ships',
    //  phase = '1: Player 1 placing ships',
    game.turnHandler(game.players[0], 'c1', 'b1');
    game.turnHandler(game.players[0], 'c2', 'e2');
    game.turnHandler(game.players[0], 'a4', 'a1');
    // //check player one to have Horizontal four piece ship, Vertical two piece ship and a horizontal three piece.
    expect(game.players[0].board.taken).toContain('a4', 'a3', 'a2', 'a1', 'c1', 'b1', 'c2', 'd2', 'e2');
    // //START PLAYER TWO
    expect(game.phase).toBe('2: Player 2 placing ships');
    // //Check for turn Status now that player one is done. Player two turn should be true.
    expect(game.players[1].isTurn).toBe(true);
    game.turnHandler(game.players[1], 'c5', 'b5');
    game.turnHandler(game.players[1], 'c4', 'e4');
    game.turnHandler(game.players[1], 'b3', 'e3');
    //Player Two turn over. 
    expect(game.players[1].isTurn).toBe(false);
    //Phase check post Players first turns. 
    expect(game.phase).toBe('3: Player 1s turn');
    expect(game.players[0].isTurn).toBe(true);
    //Current GAME Board set up
    // a    [hx, hx,  hx,  hx, 5]    x is player 1
    // b:   [x,  2,   h0,  m4, h0]   o is player 2
    // c:   [hx, hx,  h0,  h0, h0]
    // d:   [1,  hx,  h0,  h0, 5]
    // e    [1,  hx,  h0,  h0, 5]
    console.log('Shooting stuff through phases.');
    //   '4: Player 2s turn',
    expect(game.turnHandler(game.players[0], 'b4')).toBe('b4 was a miss | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.players[0].board.shotAt).toContain('b4');
    game.turnHandler(game.players[1], 'a1');
    expect(game.players[0].ships[2].health).toBe(3);
    expect(game.turnHandler(game.players[0], 'b5')).toBe('b5 was a hit | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.turnHandler(game.players[1], 'a2')).toBe('a2 was a hit | 3: Player 1s turn | 2\'s turn was processed.');
    expect(game.turnHandler(game.players[0], 'c5')).toBe('A ship was sunk | 4: Player 2s turn | 1\'s turn was processed.');
    console.log('Player One Sinks Player Two 2 peice ship.\n');
    expect(game.players[1].ships[0].health).toBe(0);
    expect(game.turnHandler(game.players[1], 'a3')).toBe('a3 was a hit | 3: Player 1s turn | 2\'s turn was processed.');
    expect(game.turnHandler(game.players[0], 'c4')).toBe('c4 was a hit | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.turnHandler(game.players[1], 'a4')).toBe('A ship was sunk | 3: Player 1s turn | 2\'s turn was processed.');
    console.log('Player Two Sinks Player One 4 peice ship.\n');
    expect(game.turnHandler(game.players[0], 'd4')).toBe('d4 was a hit | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.turnHandler(game.players[1], 'c2')).toBe('c2 was a hit | 3: Player 1s turn | 2\'s turn was processed.');
    expect(game.turnHandler(game.players[0], 'e3')).toBe('e3 was a hit | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.turnHandler(game.players[1], 'd2')).toBe('d2 was a hit | 3: Player 1s turn | 2\'s turn was processed.');
    expect(game.turnHandler(game.players[0], 'd3')).toBe('d3 was a hit | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.turnHandler(game.players[1], 'e2')).toBe('A ship was sunk | 3: Player 1s turn | 2\'s turn was processed.');
    console.log('Player Two Sinks Player One 3 peice ship.\n');
    console.log(game.players[0].ships[1]);
    expect(game.turnHandler(game.players[0], 'c3')).toBe('c3 was a hit | 4: Player 2s turn | 1\'s turn was processed.');
    expect(game.turnHandler(game.players[1], 'c1')).toBe('c1 was a hit | 3: Player 1s turn | 2\'s turn was processed.');
    expect(game.players[0].isTurn).toBe(true);
    expect(game.turnHandler(game.players[0], 'b3')).toBe('A ship was sunk | 4: Player 2s turn | 1\'s turn was processed.');
    console.log('Player ONE Sinks Player TWO 4 peice ship.\n');
    expect(game.players[1].ships[2].health).toBe(0);
    expect(game.players[1].isTurn).toBe(true);
    expect(game.turnHandler(game.players[1], 'b1')).toBe('1 lost | 5: Game Over | 2\'s turn was processed.');
    console.log('Player Two Sinks Player One 2 peice ship.\n');
   
    //   '5: Game Over',
    expect(game.players[0].ships[0].health).toBe(0);
    expect(game.players[0].ships[1].health).toBe(0);
    expect(game.players[0].ships[2].health).toBe(0);

    expect(game.players[1].ships[0].health).toBe(0);
    expect(game.players[1].ships[1].health).toBe(1);
    expect(game.players[1].ships[2].health).toBe(0);

    expect(game.phase).toBe('5: Game Over');
    console.log(game.phase);
   
  });






















});

// expect(function(){
//   game.turnHandler(game.players[0], 'z1142', 'z4');
// }).toThrow(Error);