const express = require("express");
const users = require('./users');
const categories = require('./categories')
const annonces = require('./annonces');
const auth = require('./auth');
const favorite = require('./favorite');

const router = express.Router();

router.use("/users", users);
router.use('/categories', categories)
router.use('/annonces', annonces)
router.use('/auth', auth);
router.use('/favorite', favorite);



module.exports = router;