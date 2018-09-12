'use strict';

jest.mock('../../../src/model/userModel');

import auth from '../../../src/middleware/auth-middleware';

describe('auth middleware', () => {

  it('works for correct user and password', done =>{
    let user = 'CapNCrunch';
    let password = 'BSD123';


    let code = btoa(`${user}:${password}`);

    let req = {
      headers: {
        authorization: `Basic ${code}`,
      },
    };
    //complete the FAkeResponse.maybe.()
    let res = new FakeResponse();

    auth(req, res, () => {
      expect(req.token).toBe('CapNCrunch token');
      expect(req.user).toBeDefined();
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
      expect(req.user).not.tobeDefined();
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

  describe('Bearer Auth', () => {
    it('works for valid token', done => {
      let token = 'capNCrunch token';
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
        expect(err).toBeDefined();
        expect(err.status).toBe(402);
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