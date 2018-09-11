'use strict';
import { Mongoose } from 'mongoose';

module.exports = (uri) => {
  return Mongoose.connect(uri, { useNewUrlParser: true});
};