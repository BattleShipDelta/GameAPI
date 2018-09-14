'use strict';

import express from 'express';
const router = express.Router();

export default router;

import cors from 'cors';

import Player from '../constructors/game';
import Game from '../models/gameModel';
import auth from '../middleware/auth-middleware';
router.use(cors());

//TODO: add auth middlware

router.post('/game', (req, res, next)=>{
  if(!req.body.participants){
    res.send(400);
    res.end();
    return;
  }else{
    let player1 = new Player(req.body.challenger);
    let player2 = new Player(req.body.opponent);
    let game = new Game({
      players: [player1, player2],
    });
    game.save()
      .then(()=>{
        res.json({
          message: `Game created, ${game.players[0]} and ${game.players[1]} place your ships!`,
        }); 
      })
      .catch(next);
  }

});

router.get('/game/:id', auth, (req, res, next)=>{
  return Game.findById(req.params.id)
    .then(game =>{
      if(!game){
        res.sendStatus(404);
        return;
      }
      console.log(req.user);
      let body = game.checkStatus(req.user);
      res.json(body);
    })
    .catch(next);
});

// router.post('/game/:id', (req, res, next)=>{
//   return Game.findById(req.params.id)
//     .then(game =>{
//       if(!game){
//         res.sendStatus(404);
//         return;
//       }
      
//     });
// });