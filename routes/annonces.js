const express = require("express");
const router = express.Router();
const db = require("../config");

router.get("/", (req, res) => {
  let sql = "SELECT * FROM annonces";
  const sqlValues = [];

  if (req.query.category) {
    sql += " WHERE category_id = ?";
    sqlValues.push(req.query.category);
  } else if (req.query.user) {
    sql += " WHERE users_id = ?";
    sqlValues.push(req.query.user);
  } else if (req.query.search) {
    sql += " WHERE name LIKE ?";
    sqlValues.push("%" + req.query.search + "%");
  } else if (req.query.region) {
    sql += " WHERE region = ?";
    sqlValues.push(req.query.region);
  }

  db.query(sql, sqlValues, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      return res.json(results);
    }
  });
});

// 2 choices query

router.get("/double", (req, res) => {
  let sql = "SELECT * FROM annonces";
  const sqlValues = [];

  if (req.query.category && req.query.region) {
    sql += " WHERE category_id = ? AND region = ?";
    sqlValues.push(req.query.category, req.query.region);
  }

  db.query(sql, sqlValues, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      return res.json(results);
    }
  });
});

// triple choice

router.get("/triple", (req, res) => {
  let sql = "SELECT * FROM annonces";
  const sqlValues = [];

  if (req.query.category && req.query.user && req.query.region) {
    sql += " WHERE category_id = ? AND users_id = ? AND region = ?";
    sqlValues.push(req.query.category, req.query.user, req.query.region);
  }

  // if (req.query.search) {
  //   sql += " WHERE name = ?";
  //   db.query(sql, ["%" + req.query.search + "%"], (err2, finds) => {
  //     if (err2) {
  //       return res.status(500).json({
  //         error: err.message,
  //         sql: err.sql,
  //       });
  //     } else if (finds.length === 0) {
  //       return res.send("Aucune annonce ne correspond à cette recherche");
  //     } else {
  //       return res.json(finds);
  //     }
  //   });
  // }

  db.query(sql, sqlValues, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      return res.json(results);
    }
  });
});

router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM annonces WHERE id = ?",
    req.params.id,
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }

      if (results.length === 0) {
        return res.send("L'annonce n'a pas pu etre trouvée");
      }

      return res.json(results[0]);
    }
  );
});

router.post("/", (req, res) => {
  db.query("INSERT INTO annonces SET ?", req.body, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    }

    return db.query(
      "SELECT * FROM annonces WHERE id = ?",
      results.insertId,
      (err2, records) => {
        if (err) {
          return res.status(500).json({
            error: err.message,
            sql: err.sql,
          });
        }

        return res.json(records[0]);
      }
    );
  });
});

router.put("/:id", (req, res) => {
  db.query(
    "UPDATE annonces SET ? WHERE id = ?",
    [req.body, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
          sql: err.sql,
        });
      }

      return db.query(
        "SELECT * FROM annonces WHERE id = ?",
        req.params.id,
        (err2, records) => {
          if (err) {
            return res.status(500).json({
              error: err.message,
              sql: err.sql,
            });
          }

          return res.json(records[0]);
        }
      );
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM annonces WHERE id = ?",
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
