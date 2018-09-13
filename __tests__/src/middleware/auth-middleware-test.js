'use strict';

import uuid from 'uuid';

import user from '../../../src/model/userModel';
import auth from '../../../src/middleware/auth-middleware';

const mongoConnect = require('../../../src/util/mongo-connect');
const MONGODB_URI = process.env.MONGODB_URI;

describe('auth middleware', () => {
  let newUser;
  let password = 'BSD123';
  beforeAll(async () => {
    await mongoConnect(MONGODB_URI);
    newUser = await new user({
      username: uuid(),
      password: password,
    }).save();
  });

  describe('basic auth', () => {
    it('works for correct user and password', done =>{
      let code = btoa(`${newUser.username}:${password}`);

      let req = {
        headers: {
          authorization: `Basic ${code}`,
        },
      };
      let res = new FakeResponse();

      auth(req, res, () => {
        expect(req.token).toBeDefined();
        expect(req.user).toBeDefined();
        expect(req.user.username).toBe(newUser.username);
        done();
      });  
    });

    it('returns erro when the authorization header is not present', done =>{
      let req = { headers: {} };
      let res = new FakeResponse();

      auth(req, res, (err) => {
        expect(err).toBeDefined();
        //402 is run authorized pmt
        expect(err.status).toBe(401);
        expect(req.token).not.toBeDefined();
        expect(req.user).not.toBeDefined();
        done();
      });
    });

    //Authorization Header
    it('returns error when the auth header is not present', done => {
      let req = { headers: {} };
      let res = new FakeResponse();
    
      auth(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        expect(req.token).not.toBeDefined();
        expect(req.user).not.toBeDefined();
        done();
      });
    });

    //Basic authorization 401
    it('returns error when the auth header is invalid Basic auth', done => {
      let req = {
        headers: {
          authorization: 'Basic Authorization',
        },
      };
      let res = new FakeResponse();
    
      auth(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        expect(req.token).not.toBeDefined();
        expect(req.user).not.toBeDefined();
        done();
      });
    });
  });

  describe('Bearer Auth', () => {
    it('works for valid token', done => {
      let token = newUser.generateToken();
      let req = {
        headers:{
          authorization: `Bearer ${token}`,
        },
      };
      let res = new FakeResponse();
    
      auth(req, res, (err)=> {
        expect(err).not.toBeDefined();
        expect(req.token).toBe(token);
        expect(req.user).toBeDefined();
        done();
      });
    });

    it('does not set token for missing user', done => {
      let token = 'capNCrunchy token!';
      let req = {
        headers:{
          authorization: `Bearer ${token}`,
        },
      };
      let res = new FakeResponse();

      auth(req, res, (err) => {
        expect(err).toHaveProperty('status', 401);
        expect(req.token).not.toBeDefined();
        expect(req.user).not.toBeDefined();
        done();
      });
    });
  });
});

class FakeResponse{
  setHeader(){
  }
}