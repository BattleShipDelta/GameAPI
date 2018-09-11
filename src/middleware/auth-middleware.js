'use strict';

import User from '../model/userModel';

export default (req, res, next) => {
  let auth = {};
  let authHeader = req.headers.authorization;


  if(!authHeader){
    return unauthorized();
  }

  function unauthorized(){
    res.setHeader('WWW-Authenticate','Basic realm="BSD"');
    next({
      status: 401,
    });
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
        unauthorized();
      })
      .catch(err => {
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
        unauthorized();
      })
      .catch(next);
  }
  else {
    unauthorized();
  }



























};