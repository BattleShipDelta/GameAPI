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
      console.log(user);
      let newPlayer = await user.save();
      console.log(newPlayer);
      let userAuthenticate = await User.authenticate({
        username: user.username,
        password: password,
      });
      expect(userAuthenticate).toBeDefined();
      expect(userAuthenticate.username).toBe(newPlayer.username);
    });
  });
});
