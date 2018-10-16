'use strict';

import app from '../../app';
import User from '../../src/models/userModel';
import Game from '../../src/models/gameModel';
import Player from '../../src/constructors/game';

import uuid from 'uuid';
const request = require('supertest')(app);
const mongoConnect = require('../../src/util/mongo-connect');
const MONGODB_URI = process.env.MONGODB_URI;

describe('an invite', ()=> {
  let user;
  let opponent;
  let token;
  beforeEach(async() => {
    await mongoConnect(MONGODB_URI);
    user = new User({
      username:uuid(),
      password:'BananaPhone123',
    });
    await user.save();
    opponent = new User({
      username: uuid(),
      password: 'AppleBook123',
    });
    await opponent.save();
    token = user.generateToken();
  });
  afterEach(async() => {
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
        //TODO Write better test for create
        expect(response.body).toBeDefined();
      });     
  });
  describe('ls but in our api', () => {
    let game;
    beforeEach(async() => {
      let p1 = new Player(user.username);
      let p2 = new Player(opponent.username);
      game = Game.start(p1,p2);
      await game.save();
    });
    afterEach(async()=> {
      await Game.deleteOne({_id: game._id});
    });
    it('finds every game that the user is in', async()=> {
      await request
        .get('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(response=>{
          expect(typeof response.body).toBe('object');
          expect(response.body[0]).toHaveProperty('id', game._id.toString());
          expect(response.body[0]).toHaveProperty('players', [user.username,opponent.username]);
          expect(response.body[0]).toHaveProperty('phase', '0: Both players placing ships');
        });
    });
   
  });
  describe('ship placing', () => {
    let game;

    beforeEach(async() => {
      let p1 = new Player(user.username);
      let p2 = new Player(opponent.username);
      game = Game.start(p1,p2);
      await game.save();
    });
    afterEach(async()=> {
      await Game.deleteOne({_id: game._id});
    });
    it('can place a ship on the board', async()=> {
      await request
        .post(`/api/games/${game._id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({coors:['a1','a2']})
        .expect(200);
    });
  });
  describe('move route', () => {
    let game;
    let opponentToken;

    beforeEach(async() => {
      let p1 = new Player(user.username);
      let p2 = new Player(opponent.username);
      game = Game.start(p1,p2);
      console.log(game.players);
      await game.save();
      opponentToken = opponent.generateToken();
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
        //need to hit c1, b1, c2, d2, e2, a4, a3, a2, a1
        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${token}`)
          .send({coors:'a1'})
          .expect(200)
          .expect(response => {
            expect(typeof response.body).toBe('object');
            expect(response.body.result.yourTurn).not.toBe(true);
            expect(response.body.result.phase).toBe('4: Player 2s turn');
            expect(response.body.result.userShots).toEqual({'a1': true});
            expect(response.body.result.opponentShots).toEqual({});
          });
        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${opponentToken}`)
          .send({coors:'e5'})
          .expect(200)
          .expect(response => {
            expect(typeof response.body).toBe('object');
            expect(response.body.result.yourTurn).not.toBe(true);
            expect(response.body.result._id).toBe(game._id.toString());
            expect(response.body.result.phase).toBe('3: Player 1s turn');
            expect(response.body.result.userShots).toEqual({'e5': false});
            expect(response.body.result.opponentShots).toEqual({'a1': true});
          });
        //need to hit c1, b1, c2, d2, e2, a4, a3, a2
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${token}`).send({coors:'a2'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${opponentToken}`).send({coors:'a2'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${token}`).send({coors:'a3'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${opponentToken}`).send({coors:'a3'});
        //sink ship length 4
        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${token}`)
          .send({coors:'a4'})
          .expect(200)
          .expect(response=>{
            console.log(response);
          });
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${opponentToken}`).send({coors:'a4'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${token}`).send({coors:'e2'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${opponentToken}`).send({coors:'e2'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${token}`).send({coors:'d2'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${opponentToken}`).send({coors:'d2'});
        //sink ship length 3
        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${token}`)
          .send({coors:'c2'})
          .expect(response=>{
            console.log(response.text);
          });
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${opponentToken}`).send({coors:'c2'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${token}`).send({coors:'c1'});
        await request.post(`/api/games/${game._id}/move`).set('Authorization', `Bearer ${opponentToken}`).send({coors:'c1'});
        // last ship sunk, player 2 loses
        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${token}`)
          .send({coors:'b1'})
          .expect(response=>{
            expect(response.text).toMatch('Game Over');
          });
          
      });
      //Bug: turnHandler doesn't check players turn?
      it('returns 403(forbidden) when you play out of turn', async()=> {

        await request
          .post(`/api/games/${game._id}/move`)
          .set('Authorization', `Bearer ${opponentToken}`)
          .send({coors:'a1'})
          .expect(403);
      });
    });
  
    //Error 'no coordinates defined' is not specific enough?
    it('returns 400(bad request) when a player shoots off the board', async()=> {
      await request
        .post(`/api/games/${game._id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({coors:'a11'})
        .expect(403);
    });
  });
});