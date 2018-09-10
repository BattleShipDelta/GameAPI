'use strict';

const express = require('express');



//import middle ware to add

const app = express();

//use middle ware here


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

module.exports = app;