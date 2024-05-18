
const express = require('express')
const routes=express.Router();
const domainRoutes=require('./domainRoutes')


routes.use('/api',domainRoutes)

routes.get('/', (req, res) => {
    res.send('Ana sayfa');
});


module.exports=routes;