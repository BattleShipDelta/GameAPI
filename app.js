'use strict';

const express = require('express');
import cors from 'cors';
import error from './src/middleware/error';
import json404 from './src/middleware/404';


const app = express();

//add routes

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
  html(res, `<!DOCTYPE html> <html><head><title> Battle Ship Delta </title></head><body><main><p> Welcome to Battle Ship Delta. Please Login Here.</p><a href=""> Login </a><p> If you don't have an account, Please Sign Up Here. </p><a href=""> Sign Up </a> <p> Thank you for joining us for this experience.</p></main><footer><div>    &copy; 2018 Battle Ship Delta </div></footer></body></html>`);
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

module.exports = app;