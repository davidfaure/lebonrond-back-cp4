const express = require('express');
const router = express.Router();
const db = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {

  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", email, (err, user) => {
      if (err) {
        return res.status(500).send('Error email');
      } else {
          const samePassword = bcrypt.compareSync(password, user[0].password);
          if (!samePassword) {
            return res.status(500).send("Error password");
          } else {
              jwt.sign({ user }, process.env.JWT_SECRET_KEY,            {
                expiresIn: "1h",
              }, (err, token) => {
                  res.json({
                      token
                  });
              });
          }
      }
  });
});

router.post('/', verifyToken, (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, (err, authData) => {
        if (err) {
          return res.status(500).send("Access denied")
        } else {
          return res.json({
                authData
            })
        }
    })
})

function verifyToken (req, res, next) {
  const bearerToken = req.headers["authorization"]
  if (typeof bearerToken !== "undefined") {
      const bearer = bearerToken.split(' ');
      req.token = bearer[1];
      next();
  }else {
      res.status(500).send("Pas de token")
  }
}

module.exports = router;