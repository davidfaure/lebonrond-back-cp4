const express = require("express");
const router = express.Router();
const db = require("../config");

router.get('/', (req, res) => {
  db.query('SELECT * FROM favorite', (err, results) => {
    if (err) {
        return res.status(500).json({
            error: err.message,
            sql: err.sql
        })
    } else {
        return res.json(results);
    }
})
});

router.post('/', (req, res) => {
  db.query('INSERT INTO favorite SET ?', req.body, (err, results) => {
    if (err) {
      return res.status(500).json({
          error: err.message,
          sql: err.sql
      })
  } else {
      return res.sendStatus(201);
  }
  })
})

module.exports = router;