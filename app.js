'use strict';

const express = require('express');
//import cors from 'cors';
import error from './src/middleware/error';
import json404 from './src/middleware/404';

import apiRouter from './src/routes/api';
import inviteRouter from './src/routes/gameRoute';


const app = module.exports = express();

//add routes
app.use(express.json());
app.use('/api', apiRouter, inviteRouter);


import authRouter from './src/routes/login-signup';
app.use(authRouter);


app.start = (port) => 
  new Promise((resolveCallBack, rejectCallBack) => {
    app.listen(port, (err, result) => {
      if(err){
        rejectCallBack(err);
      }else {
        resolveCallBack(result);
      }
    });
  });

app.get('/', (req, res) => {
  html(res, `<!DOCTYPE html>
    <html>
      <head>
        <title> 
          Battle Ship Delta
        </title>
      </head>
      <body>
        <main>
          <h1> 
            Welcome to Battle Ship Delta.
          </h1>
          <p> 
            If you don't have an account, please sign up here. 
          </p>
          <form method='post' action='/signup'>
            <p>Username</p>
            <input placeholder=username>
            <p> Password</p>
            <input placeholder=password>
            <p>Repeat Password</p>
            <input placeholder='repeat password'>
            <button>
              Submit
            </button>
          </form>
          <p> 
            If you do have an account, Please Login Here.
          </p>
          <a href="/login"> Login </a>
          <p> 
            Thank you for joining us for this experience.
          </p>
        </main>
        <footer>
          <div>&copy; 2018 Battle Ship Delta 
        </div>
      </footer>
    </body>
  </html>`
  );
});

app.post('/signup', (req, res) => {
  alert('You signed up');
});

app.get('/signup', (req, res) => {
  res.render('res.body');
});

app.use(json404);
app.use(error);

function html(res, content, statusCode=200, statusMessage='OK') {
  res.statusCode = statusCode;
  res.statusMessage = statusMessage;
  res.setHeader('Content-Type', 'text/html');
  res.write(content);
  res.end();
}
