'use strict';

import express from 'express';
const router = express.Router();

import Player from '../constructors/game';
import Game from '../models/gameModel';
import User from '../model/userModel';
import auth from '../middleware/auth-middleware';
import { request } from 'http';

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
    });
  });
  res.json(gameIds);
  return;
});
 

router.post('/games/:id/move', auth, async(req, res)=>{
  console.log('move route');
  let game = await Game.findById(req.params.id);
  console.log(game);
  console.log(req.body);
  console.log(req.body.coors);
  let player = game.players.find(player => player.name === req.user.username);
  let coords = req.body.coors;
  if(typeof(coords) !== 'object' ){
    coords = [coords];
  }
  try{
    let result = game.turnHandler(player, ...coords);
    console.log(result);
    res.send(200, { result });
    
    
  }
  catch(error){
    console.log(game.phase);
    console.log(error.message);
    res.send(403, { error: error.message });
  }
});

export default router;