'use strict';

import app from '../../app';
const request = require('supertest')(app);

import uuid from 'uuid';
import User from '../../src/models/userModel';

const mongoConnect = require('../../src/util/mongo-connect');

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb://localhost/401-2018-auth';

describe('auth routes', () => {
  beforeAll(async () => {
    await mongoConnect(MONGODB_URI);
  });

  describe('signup', () => {
    it('creates user from valid body', () => {
      const password = uuid();

      return request
        .post('/signup')
        .send({ username: uuid(), password })
        .expect(200)
        .expect(response => {
          expect(response.body).toBeDefined();
          expect(response.body.token).toBeDefined();
        });
    });

    it('throw an error if username is already in use', async () => {
      const password = uuid();
      const user = new User({
        username: uuid(),
        password: password,
      });
      await user.save();
      
      console.log('409');
      await request
        .post('/signup')
        .send({ username: user.username, password })
        .expect(409);
    });

    it('returns an error if no username is given', () => {
      const password = uuid();

      return request
        .post('/signup')
        .send({ username: undefined, password })
        .expect(400);
    });

    it('returns an error if no password is provided', () => {
      return request
        .post('/signup')
        .send({ username: uuid(), password: ''})
        .expect(400);
    });
  });

  describe('login', () => {
    let password = uuid();
    let user;
    beforeEach(() => {
      user = new User({
        username: uuid(),
        password,
      });
      return user.save();
    });
    afterEach(async() => {
      await User.deleteOne({ _id: user._id});
    });
    it('GET returns 200 for a good login', () => {
      return request
        .get('/login')
        .auth(user.username, password)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveProperty('token');
        });
    });

    it('POST returns 200 for a good login', () => {
      return request
        .post('/login')
        .auth(user.username, password)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveProperty('token');
        });
    });

    it('returns 401 for a bad login', () => {
      return request
        .get('/login')
        .auth(user.username, 'oops')
        .expect(401);
    });
  });

  describe('GET /user', () => {
    let password = uuid();
    let user;
    let token;
    beforeEach(() => {
      user = new User({
        username: uuid(),
        password,
      });
      return user.save();
    });
    afterEach(async() => {
      await User.deleteOne({ _id: user._id});
    });
    it('returns the user', async() => {
      token = user.generateToken();
      console.log(token);
      await request
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(response => {
          expect(response.body.user).toBe(user.username);
        });
    });
  });
});