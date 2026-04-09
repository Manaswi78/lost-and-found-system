const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { sendEmail } = require("../utils/notification");

// ======================
// REPORT LOST ITEM
// ======================
router.post("/lost", (req, res) => {
  const { user_id, item_name, description, location, date_lost } = req.body;

  // 1️⃣ Insert into lost_items
  const insertLost = `
    INSERT INTO lost_items (user_id, item_name, description, location, date_lost)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(insertLost, [user_id, item_name, description, location, date_lost], (err, result) => {
    if (err) {
      console.log("❌ Insert Error:", err);
      return res.status(500).send("Error adding lost item");
    }

    console.log("📦 Lost item added:", item_name);

    // 2️⃣ Check for matching found items
    const matchFoundSql = `
      SELECT * FROM found_items 
      WHERE item_name LIKE ? 
      AND location LIKE ?
    `;
    db.query(matchFoundSql, [`%${item_name}%`, `%${location}%`], (err2, foundMatches) => {
      if (err2) {
        console.log("❌ Match Error:", err2);
        return res.status(500).send("Error finding matches");
      }

      if (foundMatches.length > 0) {
        // 3️⃣ Insert into matches table for each found match
        foundMatches.forEach(f => {
          const insertMatch = `
            INSERT INTO matches 
            (user_id, lost_item_name, date_lost, found_item_name, date_found, found_location, found_user_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
          `;
          db.query(
            insertMatch,
            [user_id, item_name, date_lost, f.item_name, f.date_found, f.location, f.user_id],
            (err3) => {
              if (err3) console.log("❌ Error inserting match:", err3);
              else console.log("✅ Match inserted for lost item:", item_name);

              // 4️⃣ Send email to the lost item owner
              const userSql = `SELECT email FROM users WHERE id = ?`;
              db.query(userSql, [user_id], (err4, userResult) => {
                if (!err4 && userResult.length > 0) {
                  sendEmail(
                    userResult[0].email,
                    "Match Found 🔔",
                    `Good news! A match found for your lost item "${item_name}" at ${f.location}.`
                  );
                }
              });
            }
          );
        });
      }

      return res.json({
        message: foundMatches.length > 0 ? "Lost item added & match found 🔥" : "Lost item added, no matches yet 😔",
        matches: foundMatches
      });
    });
  });
});

// ======================
// REPORT FOUND ITEM
// ======================
router.post("/found", (req, res) => {
  const { user_id, item_name, description, location, date_found } = req.body;

  // 1️⃣ Insert into found_items
  const insertFound = `
    INSERT INTO found_items (user_id, item_name, description, location, date_found)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(insertFound, [user_id, item_name, description, location, date_found], (err, result) => {
    if (err) {
      console.log("❌ Insert Found Error:", err);
      return res.status(500).send("Error adding found item");
    }

    console.log("🔍 Found item added:", item_name);

    // 2️⃣ Check for matching lost items
    const matchLostSql = `
      SELECT * FROM lost_items 
      WHERE item_name LIKE ? 
      AND location LIKE ?
    `;
    db.query(matchLostSql, [`%${item_name}%`, `%${location}%`], (err2, lostMatches) => {
      if (err2) {
        console.log("❌ Match Lost Error:", err2);
        return res.status(500).send("Error finding matches");
      }

      if (lostMatches.length > 0) {
        lostMatches.forEach(l => {
          const insertMatch = `
            INSERT INTO matches
            (user_id, lost_item_name, date_lost, found_item_name, date_found, found_location, found_user_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
          `;
          db.query(
            insertMatch,
            [l.user_id, l.item_name, l.date_lost, item_name, date_found, location, user_id],
            (err3) => {
              if (err3) console.log("❌ Error inserting match:", err3);
              else console.log("✅ Match inserted for found item:", item_name);

              // 3️⃣ Send email to lost item owner
              const userSql = `SELECT email FROM users WHERE id = ?`;
              db.query(userSql, [l.user_id], (err4, userResult) => {
                if (!err4 && userResult.length > 0) {
                  sendEmail(
                    userResult[0].email,
                    "Match Found 🔔",
                    `Good news! A match found for your lost item "${l.item_name}" at ${location}.`
                  );
                }
              });
            }
          );
        });
      }

      res.send(lostMatches.length > 0 ? "Found item added & match triggered 🔥" : "Found item reported successfully 🔍");
    });
  });
});

// ======================
// VIEW MATCHES FOR USER
// ======================
router.get("/matches/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT m.*, u.name AS found_by
    FROM matches m
    JOIN users u ON m.found_user_id = u.id
    WHERE m.user_id = ? OR m.found_user_id = ?
    ORDER BY m.id DESC
  `;

  db.query(sql, [user_id, user_id], (err, results) => {
    if (err) {
      console.log("❌ Error fetching matches:", err);
      return res.status(500).send("Error fetching matches");
    }

    console.log("📥 Matches fetched:", results);
    res.json(results);
  });
});

module.exports = router;