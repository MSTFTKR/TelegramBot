
const express = require('express')
const routes=express.Router();
const domainRouter=require('./domainRouter')
const userRouter=require('./userRouter')
const checksRouter=require('./checksRouter')

routes.use('/domain',domainRouter)
routes.use('/user',userRouter)
routes.use('/checks',checksRouter)
routes.get('/', (req, res) => {
    res.send('Ana sayfa');
});

module.exports=routes;