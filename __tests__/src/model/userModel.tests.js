'use strict';

import User from '../../../src/model/userModel';
import uuid from 'uuid';

const mongoConnect = require('../../../src/util/mongo-connect');

const MONGODB_URI = process.env.MONGODB_URI;

describe('user model', () => {
  beforeAll(async () => {
    await mongoConnect(MONGODB_URI);
  });

  it('saves password as a hashed value', async () => {
    let password = 'BSD123';
    let user = new User({
      username: uuid(),
      password: password,
    });
    let newPlayer = await user.save();
    expect(newPlayer.password).not.toEqual(password);
    expect( await newPlayer.comparePassword(password)).toBe(newPlayer);
    expect( await newPlayer.comparePassword('password')).toBe(null);
  });

  describe('user.authenticate()', () => {
    it('resolves with user given correct password', async () => {
      let password = 'BSD123';
      let user = new User({
        username: uuid(),
        password: password,
      });
      let newPlayer = await user.save();
      let userAuthenticate = await User.authenticate({
        username: user.username,
        password: password,
      });
      expect(userAuthenticate).toBeDefined();
      expect(userAuthenticate.username).toBe(newPlayer.username);
    });
  });

  describe('user authorize()', () => {
    let password = 'BSD123';
    let user;
    beforeAll(async() => {
      user = new User({
        username: uuid(),
        password: password,
      });
      await user.save();
    });
    afterAll(async() => {
      await User.deleteMany({ _id: user._id});
    });

    it('can get usre from a vaild token', async () => {
      
      var token = user.generateToken();

      let authorizedUser = await User.authorize(token);
      expect(authorizedUser).toBeDefined();
      expect(authorizedUser._id).toEqual(user._id);
    });
    it('rejects the authorization with a bad token', async() => {
      var token = 'BadToken1234';

      let authorization = await User.authorize(token);
      expect(authorization).toBe(null);
    });
  });
});
