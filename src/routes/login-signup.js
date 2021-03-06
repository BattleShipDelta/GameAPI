'use strict';

import superagent from 'superagent';

import express from 'express';
const authRouter = express.Router();

import User from '../models/userModel';
import auth from '../middleware/auth-middleware';

authRouter.post('/signup', (req, res, next) => {
  console.log('POST /signup');
  let user = new User(req.body);
  user.save()
    .then(user => {
      res.send({
        token: user.generateToken(),
      });
    })
    .catch(next);

    
});

authRouter.get('/login', auth, (req, res) => {
  res.send({
    token: req.token,
  });
});

authRouter.post('/login', auth, (req, res) => {
  res.send({
    token: req.token,
  });
});

authRouter.get('/user', auth, (req, res) => {
  res.send({
    user: req.user.username,
  });
});
export default authRouter;