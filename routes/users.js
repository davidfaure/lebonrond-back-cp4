const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require("../config");
const { check, validationResult } = require('express-validator');

const userValidationMiddlewares = [
// email must be valid
check('email').isEmail().withMessage('email pas valable'),
// password must be at least 8 chars long
check('password').isLength({ min: 5 }).withMessage('le mot de passe doit contenir au moins 5 caractères'),
// let's assume a name should be 2 chars long
check('firstname').isLength({ min: 2 }),
];


router.get("/", (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
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

router.get('/:id/favorite', (req, res) => {
  sql = 'SELECT * FROM users as u JOIN favorite as f on f.users_id = u.id JOIN annonces as a on f.annonces_id = a.id WHERE u.id = ?';

  db.query(sql, req.params.id, (err, results) => {
    if (err) {
      return res.status(500).json({
          error: err.message,
          sql: err.sql
      })
    } 

    if (results.length === 0) {
      return res.send("Les annonces favorites de l'utilisateur n'ont pas pu etre trouvées")
    }

    return res.json(results);

  })
})

router.get('/:id', (req, res) => {

  db.query('SELECT * FROM users WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        } 

        if (results.length === 0) {
            return res.send("L'utilisateur n'a pas pu etre trouvé")
        }
        
        return res.json(results[0]);
    })
})

router.post('/',userValidationMiddlewares, (req, res) => {

const errors = validationResult(req);
if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
}

if(req.body.email) {

    db.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, results) => {
        const hash = bcrypt.hashSync(req.body.password, 10);
        
        const formData = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hash,
            address: req.body.address,
            cp: req.body.cp,
            region: req.body.region,
            city: req.body.city,
            phone: req.body.phone
            }
            
        
        if (err) {
            return res.status(500).json({error: err.message}); 
        } else {

            if (results[0] != undefined) {
                return res.status(500).send("Cet email est déjà pris")
            } else {
                // Hash password CHANGER Dans mySQL.

                db.query('INSERT INTO users SET ?', formData, (err, results) => {
                    if (err) {
                        return res.status(500).json({
                            error: err.message,
                            sql: err.sql
                        });
                    }
                    return db.query('SELECT * FROM users WHERE id = ?', results.insertId, (err2, records) => {
                        if (err2) {
                            return res.status(500).json({
                                error: err2.message,
                                sql: err2.sql,
                            });
                        }
                        const insertedUsers = records[0];
                        const { password, ...user } = insertedUsers;
                        const host = req.get('host');
                        const location = `http://${host}${req.url}/${user.id}`;
                        return res
                        .status(201)
                        .set('Location', location)
                        .json(user);
                    })
                })
            }
        }
    })
} else {
    return res.send("L'email est requis")
}
})

router.put('/:id', userValidationMiddlewares, (req, res) => {

const hash = bcrypt.hashSync(req.body.password, 10);
        
        const formData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        address: req.body.address,
        cp: req.body.cp,
        region: req.body.region,
        city: req.body.city,
        phone: req.body.phone
        }

db.query('UPDATE users SET ? WHERE id = ?', [formData, req.params.id], (err, results) => {
    if (err) {
        return res.status(500).json({
            error: err.message,
            sql: err.sql
        });
    }

    return db.query('SELECT * FROM users WHERE id = ?', req.params.id, (err2, records) => {
        if (err2) {
            return res.status(500).json({
                error: err2.message,
                sql: err2.sql
            });
        }
        return res.status(200).json(records[0]);
    })
})
})

router.delete("/:id", (req, res) => {
    db.query(
        "DELETE FROM users WHERE id = ?",
        req.params.id,
        (err, resutls) => {
        if (err) {
            return res.status(500).json({
            error: err.message,
            sql: err.sql,
            });
        } else {
            return res.status(200).json({ statut: "deleted" });
        }
        }
    );
});

module.exports = router;