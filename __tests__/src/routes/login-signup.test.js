'use strict';

import app from '../../../app';
const request = require('supertest')(app);

import uuid from 'uuid';
import User from '../../../src/model/userModel';

const mongoConnect = require('../../../src/util/mongo-connect');

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

    it('throw an error if username is already in use', () => {
      const password = uuid();
      const username1 = 'John';
      
      return request
        .post('/signup')
        .send({ username2: 'John', password })
        .expect(400);
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
});