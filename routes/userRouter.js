const express=require('express')
const route=express.Router();
const userController=require('../controllers/userController')


route.post('/create',userController.createUser)
route.put('/update',userController.updateEmail)
route.get('/find/:userName',userController.findUser)


module.exports=route;