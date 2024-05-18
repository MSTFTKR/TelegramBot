
const express = require('express')
const routes=express.Router();
const domainApi=require('../apis/domainApis')
const authMiddleware=require('../auth/authMiddleware')



routes.post('/domain-history',authMiddleware,domainApi.domainHistory)

module.exports=routes;