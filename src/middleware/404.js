'use strict';

export default (req, res, next) => {
  res.statusCode = 404;
  res.json({
    error: 'Not Found',
  });
  res.setHeader('Content-Type', 'application/json; charset=uf-8');
};