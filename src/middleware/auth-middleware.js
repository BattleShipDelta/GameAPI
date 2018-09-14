'use strict';

import User from '../models/userModel';

export default (req, res, next) => {
  let auth = {};
  let authHeader = req.headers.authorization;
  console.log('auth', req.url);

  if(!authHeader){
    console.log('No auth header');
    return unauthorized();
  }

  if(authHeader.match(/^basic\s+/i)){
    let base64header = authHeader.replace(/^basic\s+/i, '');
    let base64buffer = Buffer.from(base64header, 'base64');
    let bufferString = base64buffer.toString();

    let[username, password] = bufferString.split(':', 2);
    auth = { username, password};

    User.authenticate(auth)
      .then(user => {
        if(user){
          req.token = user.generateToken();
          req.user = user;
          return next();
        }
        console.log(`user ${username} not found`);
        unauthorized();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  }
  else if (authHeader.match(/^bearer\s+/i)) {
    let token = authHeader.replace(/^bearer\s+/i, '');
    User.authorize(token)
      .then(user => {
        if(user){
          req.token = token;
          req.user = user;
          return next();
        }
        console.log(`user not found for token ${token}`);
        unauthorized();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  }
  else {
    console.log(`auth only supports Basic or Bearer; found ${authHeader}`);
    unauthorized();
  }

  function unauthorized(){
    res.setHeader('WWW-Authenticate','Basic realm="BSD"');
    next({
      status: 401,
    });
  }

};