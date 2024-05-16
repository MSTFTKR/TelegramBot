const express=require('express')
const route=express.Router();
const checkController=require('../controllers/checkController.js')


route.post('/create',checkController.createCheck)


module.exports=route;