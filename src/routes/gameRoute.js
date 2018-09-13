'use strict';

import express from 'express';
const router = express.Router();

import Player from '../constructors/game';
import Game from '../models/gameModel';
import User from '../model/userModel';
import auth from '../middleware/auth-middleware';

router.post('/games', auth, async(req,res) => {
  let p1 = new Player(req.user.username);
  let p2 = new Player(req.body.opponent);
  if (await User.findOne({username: req.body.opponent})){
    let game = Game.start(p1, p2);
    let saved = await game.save();
    console.log(game);
    let message = `Game ${saved._id} was created, players place your ships.`;
    res.send(message);

    return;
  }else{
    res.send(400);
  }
  
});

export default router;