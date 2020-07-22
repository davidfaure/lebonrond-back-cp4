const express = require("express");
const router = express.Router();
const db = require("../config");

router.get("/", (req, res) => {
  db.query('SELECT * FROM category', (err, results) => {
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

// by category

router.get('/:category_id/annonces', (req, res) => {
  db.query('SELECT * FROM annonces WHERE category_id = ?', req.params.category_id, (err, results) => {
    if (err) {
      return res.status(500).json({
          error: err.message,
          sql: err.sql
      })
  } 

  if (results.length === 0) {
      return res.send("Les annonces de cette catégorie n'ont pas pu etre trouvées")
  }
  
  return res.json(results[0]);
  })
})

router.get('/:id', (req, res) => {

  db.query('SELECT * FROM category WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        } 

        if (results.length === 0) {
            return res.send("La catégorie n'a pas pu etre trouvée")
        }
        
        return res.json(results[0]);
    })
})

router.post('/', (req, res) => {
  if (req.body.name) {

    db.query('SELECT * FROM category WHERE name = ?', req.body.name, (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        })
      } else { 

        if (results[0] != undefined) {
          return res.send('Cette catégorie est déjà dans la base de donnée')
        } else {

          db.query('INSERT INTO category SET ?', req.body, (err, results) => {
            if (err) {
              return res.status(500).json({
                  error : err.message,
                  sql: err.sql,
              })
            }

            return db.query('SELECT * FROM category WHERE id = ?', results.insertId, (err2, records) => {
              if (err2) {
                return res.status(500).json({
                    error : err2.message,
                    sql: err2.sql,
                })
            }

              return res.json(records[0]);

            })

          })

        }

      }
    })
  } else {
    return res.send('le nom de la catégorie est requis');
  }
})

module.exports = router;