'use strict';

require('babel-register');

require('dotenv').config();

const mongoose = require('mongoose');


const server = require('./app');

const PORT = process.env.PORT;
if(!PORT) throw new Error('PORT not set!');

const MONGODB_URI = process.env.MONGODB_URI;
if(!MONGODB_URI) throw new Error('PORT not set!');

const mongoConnect = (uri) => {
    return mongoose.connect(uri, { useNewUrlParser: true });
};
mongoConnect(MONGODB_URI)
.then(() => server.start(process.env.PORT))
.then(() => console.log(`Listening on ${PORT}`));
