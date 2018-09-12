'use strict';

const request = require('supertest');
import app from '../../../app';


describe('app', ()=> {
  let user1;
  let user2;

  let participants = [];
  beforeAll(()=> {
    user1 = {'name':1};
    user2 = {'name':2};
    participants = [user1, user2];
    console.log(participants);
  });

  it('returns a 400 bad request if no users are given to create a game', ()=> {
    return request(app)
      .post('/api/game')
      .expect(400);
  });

});
