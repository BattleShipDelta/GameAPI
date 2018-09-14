'use strict';

export default (err, req, res, next) => {
  if(err.name === 'CastError') {
    res.sendStatus(404);
    return;
  }
  if(err.name === 'ValidationError') {
    res.statusCode = 400;
    res.json({
      message: err.message,
    });
    return;
  }

  if(err.code === 11000) {
    res.statusCode = 409;
    res.json({
      message: 'This name is taken. Please try again',
    });
    return;
  }
  if(req.headers['accept'] !== 'application/json') {
    next(err);
    return;
  }
  res.statusCode = 500;
  res.json({
    error: err.message,
  });
};