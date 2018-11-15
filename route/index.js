const router = require('express').Router();
const controller = require('./login');
router.get('/login', controller.loginget);
router.post('/login', controller.loginpost);
router.get('/logout', controller.logout);
module.exports = router;