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
  });

  it('returns a 400 bad request if no users are given to create a game', ()=> {
    return request(app)
      .post('/api/game')
      .expect(400);
  });

  it('creates a new game with two users on a valid request',()=> {
    return request(app)
      .post('api/game')
      .send(participants)
      .expect(200)
      .expect(response => {
        expect(response.body.message).toBe('Game created, players place your ships!');
      });
  });

});
