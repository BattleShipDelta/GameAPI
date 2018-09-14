'use strict';

import app from '../../../app';
import Player from '../../../src/constructors/game';
import User from '../../../src/model/userModel';
import Game from '../../../src/models/gameModel';
import uuid from 'uuid';
const request = require('supertest')(app);
const mongoConnect = require('../../../src/util/mongo-connect');
const MONGODB_URI = process.env.MONGODB_URI;


describe('app', ()=> {
  let user;
  let opponent;
  let token;
  let p1;
  let p2;
  beforeAll(async() => {
    await mongoConnect(MONGODB_URI);
    user = new User({
      username: uuid(),
      password:'BananaPhone123',
    });
    await user.save();
    opponent = new User({
      username: uuid(),
      password: 'AppleBook123',
    });
    await opponent.save();
    token = user.generateToken();
    p1 = new Player(user.username);
    p2 = new Player(opponent.username);
  });
  afterAll(async() => {
    await User.deleteOne({ _id: user._id});
    await User.deleteOne({ _id: opponent._id});
  });
  it('can check the status of an existing game', async()=>{
    let game = new Game({
      players: [p1, p2],
    });
    let saved = await game.save();
    await request
      .get(`/api/game/${saved._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(response =>{
        console.log(response.body);
        expect(response.body.phase).toBe('0: Both players placing ships');
        expect(response.body.shipStatuses[0].health).toBe(2);
        expect(response.body.yourTurn).toBe(true);
      });
  });
});
