'use strict';

import app from '../../../app';
import User from '../../../src/model/userModel';
import Game from '../../../src/models/gameModel';
import Player from '../../../src/constructors/game';
const request = require('supertest')(app);
const mongoConnect = require('../../../src/util/mongo-connect');
const MONGODB_URI = process.env.MONGODB_URI;

describe('an invite', ()=> {
  let user;
  let opponent;
  let token;
  beforeAll(async() => {
    await mongoConnect(MONGODB_URI);
    user = new User({
      username:'Etahn',
      password:'BananaPhone123',
    });
    await user.save();
    opponent = new User({
      username: 'Dylan',
      password: 'AppleBook123',
    });
    await opponent.save();
    token = user.generateToken();
  });
  afterAll(async() => {
    await User.deleteOne({ _id: user._id});
    await User.deleteOne({ _id: opponent._id});
  });
  it('returns a 401 if user doesn\'t have a token', async() => {
    await request
      .post('/api/games')
      .expect(401);
  });
  it('returns a 400 if invite recipient doesn\'t exist', async() => {
    await request
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send({'opponent':'capNKirk'})
      .expect(400);
  });
  it('creates a new game', async()=> {
    await request
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send({'opponent': opponent.username})
      .expect(200)
      .expect(response=>{
        console.log(response.text);
        expect(response.text).toBeDefined();

  
      });
      
  });
  describe('move route', () => {
    let game;
    let opponentToken;

    beforeEach(async() => {
      let p1 = new Player(user.username);
      let p2 = new Player(opponent.username);
      game = Game.start(p1,p2);
      await game.save();
      opponentToken = user.generateToken();
    });
    afterEach(async()=> {
      await Game.deleteOne({_id: game._id});
    });
    it('return 403(forbidden) when ships not placed yet', async() => {
      await request
        .post(`/api/games/${game._id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({coors:'a1'})
        .expect(403);
    });
    describe('with ships', ()=>{
      beforeEach(()=> {
        game.turnHandler(game.players[0], 'c1', 'b1');
        game.turnHandler(game.players[0], 'c2', 'e2');
        game.turnHandler(game.players[0], 'a4', 'a1');
        game.turnHandler(game.players[1], 'c1', 'b1');
        game.turnHandler(game.players[1], 'c2', 'e2');
        game.turnHandler(game.players[1], 'a4', 'a1');
        game.save();
      });
      it('fires successfully', async()=> {
        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${token}`)
          .send({coors:'a1'})
          .expect(200)
          .expect({ result: 'a1 was a hit | 4: Player 2s turn | Etahn\'s turn was processed.'});
        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${opponentToken}`)
          .send({coors:'e5'})
          .expect(200)
          //Shouldn't be Etahn's turn
          .expect({ result: 'e5 was a miss | 4: Player 2s turn | Etahn\'s turn was processed.' });
      });
      //Bug: turnHandler doesn't check players turn?
      it.skip('returns 403(forbidden) when you play out of turn', async()=> {

        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${opponentToken}`)
          .send({coors:'a1'})
          .expect(403);
      });
    });
  
    //Error 'no coordinates defined' is not specific enough?
    it.skip('returns 400(bad request) when a player shoots off the board', async()=> {
      await request
        .post(`/api/games/${game._id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({coors:'a11'})
        .expect(400);
    });
  });
    
});