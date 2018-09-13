'use strict';

import app from '../../../app';
import User from '../../../src/model/userModel';
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
      .expect(200);
    //TODO: Send game state in response
      
  });
});