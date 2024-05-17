
const express = require('express')
const routes=express.Router();

routes.get('/', (req, res) => {
    res.send('Ana sayfa');
});

module.exports=routes;