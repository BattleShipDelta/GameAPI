'use strict';

import express from 'express';
const router = express.Router();

export default router;

import cors from 'cors';

import Game from '../constructors/game';
router.use(cors());

//TODO: add auth middlware

router.post('/game', (req, res, next)=>{
  if(!req.body.participants){
    res.send(400);
    res.end();
    return;
  }else{
    let game = new Game(req.body.participants);
    game.save()
      .then(()=>{
        res.json({
          message: 'Game created, players place your ships!',
        }); 
      })
      .catch(next);
  }

});



