const sqlite3 = require('sqlite3').verbose();

let db;

function initialize() {
    db = new sqlite3.Database('items.db');
    db.run("CREATE TABLE IF NOT EXISTS Table1 (id INTEGER PRIMARY KEY, itemName TEXT, count INTEGER, img TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS Table2 (id INTEGER PRIMARY KEY, itemName TEXT, img TEXT)");
}

function getItems() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Table1", (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

function addItem(itemName, count, img) {
  const url =  "https://www.pngplay.com/wp-content/uploads/13/Scuderia-Ferrari-Transparent-PNG.png"
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Table1 (itemName, count, img) VALUES (?, ?, ?)", [itemName, count, url], function (err) {
            if (err) reject(err);
            resolve({ id: this.lastID, itemName, count });
        });
    });
}

function deleteItem(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Table1 WHERE id = ?", [id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

function updateItem(id, itemName, count) {
    console.log(id, itemName, count);
    return new Promise((resolve, reject) => {
        db.run("UPDATE Table1 SET itemName = ?, count = ? WHERE id = ?", [itemName, count, id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

function addToTable2(itemName) {
  const imgUrl = "https://www.pngplay.com/wp-content/uploads/13/Scuderia-Ferrari-Transparent-PNG.png";
  db.run("INSERT INTO Table2 (itemName, img) VALUES (?, ?)", [itemName, imgUrl]);
  // return new Promise((resolve, reject) => {
  //   db.get("SELECT img FROM Table1 WHERE itemName = ?", [itemName], (err, row) => {
  //     if (err) {
  //       console.error("Error fetching item:", err);
  //       reject(err);
  //     } else if (row && row.count > 0) {
  //       const imgUrl = row.img;
  //       db.run("INSERT INTO Table2 (itemName, img) VALUES (?, ?)", [itemName, imgUrl], function (updateErr) {
  //         if (updateErr) {
  //           console.error("Error updating item count:", updateErr);
  //           reject(updateErr);
  //         } else {
  //           resolve(true);
  //         }
  //       });
  //     } else {
  //       console.log("Item not found or out of stock:", itemName);
  //       resolve(false);
  //     }
  //   });
  // });
}

function removeFromTable2(itemName) {
    db.run("DELETE FROM Table2 WHERE itemName = ?", [itemName]);
}

function getTable2Items() {
     return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Table2", (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

function deleteItem2(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Table2 WHERE id = ?", [id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

function decrementPrizeStock(prizeName) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE Table1 SET count = count - 1 WHERE itemName = ? AND count > 0', [prizeName], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  
  function decrementItem(itemName) {
    return new Promise((resolve, reject) => {
      db.get("SELECT count FROM Table1 WHERE itemName = ?", [itemName], (err, row) => {
        if (err) {
          console.error("Error fetching item:", err);
          reject(err);
        } else if (row && row.count > 0) {
          const newCount = row.count - 1;
          db.run("UPDATE Table1 SET count = ? WHERE itemName = ?", [newCount, itemName], function (updateErr) {
            if (updateErr) {
              console.error("Error updating item count:", updateErr);
              reject(updateErr);
            } else {
              resolve(true);
            }
          });
        } else {
          console.log("Item not found or out of stock:", itemName);
          resolve(false);
        }
      });
    });
  }
  
  module.exports = { decrementItem };

module.exports = { decrementItem,decrementPrizeStock, initialize, getItems, addItem, deleteItem, updateItem, addToTable2, removeFromTable2, getTable2Items, deleteItem2 };
