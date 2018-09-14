'use strict';

import app from '../app';
const request = require('supertest')(app);

describe('app', () => {
  
  it('responds with 404 for a bad path', async () => {
    await request
      .get('/404')
      .expect(404, { error: 'Not Found' })
      .expect('Content-Type', 'application/json; charset=utf-8');
  });

  describe('home route', () => {
    
    it('responds with 200 for the home page', async () => {
      await request
        .get('/')
        .expect(200)
        .expect('Content-Type', 'text/html');
    });
  });
});