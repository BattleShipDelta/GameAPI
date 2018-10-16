'use strict';

import express from 'express';
const router = express.Router();

import Player from '../constructors/game';
import Game from '../models/gameModel';
import User from '../models/userModel';
import auth from '../middleware/auth-middleware';
import { request } from 'http';

router.post('/games', auth, async(req,res) => {
  let p1 = new Player(req.user.username);
  let p2 = new Player(req.body.opponent);
  if (await User.findOne({username: req.body.opponent})){
    let game = Game.start(p1, p2);
    let saved = await game.save();
    console.log(game);
    res.send(saved._id);

    return;
  }else{
    res.send(400);
  }
  
});

router.get('/games', auth, async(req, res, next)=>{
  let username = req.user.username;
  console.log(username);
  let games = await Game.find({
    players:{
      $elemMatch: {
        name: username,
      },
    },
  });
  let gameIds = [];
  games.forEach(game=>{
    gameIds.push({
      id:game._id,
      players:game.players.map(player => player.name),
      phase:game.phase,
    });
  });
  res.json(gameIds);
  return;
});
 

router.get('/games/:id', auth, (req, res, next)=>{
  return Game.findById(req.params.id)
    .then(game =>{
      if(!game){
        res.sendStatus(404);
        return;
      }
      let body = game.checkStatus(req.user);
      res.json(body);
    })
    .catch(next);
});

router.post('/games/:id/move', auth, async(req, res)=>{
  let game = await Game.findById(req.params.id);
  let player = game.players.find(player => player.name === req.user.username);
  let coors = req.body.coors;
  if(typeof(coors) !== 'object' ){
    coors = [coors];
  }
  try{
    game.turnHandler(player, ...coors);
    await game.save();
    let result = game.checkStatus(req.user);
    res.send(200, { result });
  }
  catch(error){
    console.log({ game, error });
    res.send(403, { error: error.message });
  }
});

export default router;