const express=require('express')
const route=express.Router();
const domainController=require('../controllers/domainController')



route.get('/listDomains',domainController.listDomains)
route.get('/listUsers',domainController.listUsers)
route.get('/allListDomains',domainController.allListDomains)
route.post('/create',domainController.createDomain)
route.delete('/delete',domainController.deleteDomain)

module.exports=route;