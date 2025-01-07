
const express = require('express');
const router = express.Router();


//controllers
const controllers = require('../controllers/adminController.js');

//jwt verify
// const authVerify = require('../middleware/verifyjwt.js')


// Define routes for bid operations
router.post('/login',controllers.login);

router.post('/creategifts',controllers.createGift)
router.get('/getAllGifts', controllers.getAllGifts)
router.post('/userlogin',controllers.userlogin)
router.post('/spin',controllers.spin)
router.get('/getAllUser',controllers.getAllUser)
router.post('/getAllGiftsbyId',controllers.getAllGiftsbyId)

module.exports = router;
