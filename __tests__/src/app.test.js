'use strict';

const request = require('supertest');
import app from '../../app';

mongoConnect = require('../../server');

MONGODB_URI = process.env.MONGODB_URI || 'mongodb://heroku_g631z6s3:9mcra5cjj584ph0jdmf1kanik1@ds251622.mlab.com:51622/heroku_g631z6s3';

describe('app', () => {
  
  it('responds with 404 for a bad path', () => {
    return request(app)
      .expect(404)
      .expect('Content-Type', 'text/html: charset=uf-8');
  });

  describe('home route', () => {
    
    it('responds with 200 for the home page',() => {
      return request(app)
        .expect(200)
        .expect('Content-Type', 'application/json: charset=utf-8');
    });
  });
});