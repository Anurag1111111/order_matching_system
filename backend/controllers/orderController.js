import { pool } from "../models/db.js";
import { decryptRSA, decryptOpenSSL } from "../utils/rsa.js"; 

export const placeOrder = async (req, res) => {
  try {
    //Encrypted handling block
    let decrypted;
    try {
      const encrypted = req.body.encryptedData;
      decrypted = JSON.parse(decryptRSA(encrypted));
    } catch (rsaError) {
      console.warn("RSA failed, using OpenSSL fallback");
      decrypted = JSON.parse(decryptOpenSSL(req.body.encryptedData));
    }

    const { type, qty, price } = decrypted;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    let remainingQty = qty;
    const completed = [];

    if (type === "buyer") {
      const [sellers] = await connection.query(
        `SELECT * FROM pending_orders WHERE type='seller' AND price <= ? ORDER BY price ASC FOR UPDATE`,
        [price]
      );

      for (const seller of sellers) {
        if (remainingQty <= 0) break;
        const matchedQty = Math.min(remainingQty, seller.qty);

        await connection.query(
          `INSERT INTO completed_orders (price, qty) VALUES (?, ?)`,
          [seller.price, matchedQty]
        );
        completed.push({ price: seller.price, qty: matchedQty });

        if (matchedQty === seller.qty) {
          await connection.query(`DELETE FROM pending_orders WHERE id = ?`, [seller.id]);
        } else {
          await connection.query(`UPDATE pending_orders SET qty = ? WHERE id = ?`, [seller.qty - matchedQty, seller.id]);
        }

        remainingQty -= matchedQty;
      }

      if (remainingQty > 0) {
        await connection.query(
          `INSERT INTO pending_orders (type, qty, price) VALUES ('buyer', ?, ?)`,
          [remainingQty, price]
        );
      }

    } else if (type === "seller") {
      const [buyers] = await connection.query(
        `SELECT * FROM pending_orders WHERE type='buyer' AND price >= ? ORDER BY price DESC FOR UPDATE`,
        [price]
      );

      for (const buyer of buyers) {
        if (remainingQty <= 0) break;
        const matchedQty = Math.min(remainingQty, buyer.qty);

        await connection.query(
          `INSERT INTO completed_orders (price, qty) VALUES (?, ?)`,
          [buyer.price, matchedQty]
        );
        completed.push({ price: buyer.price, qty: matchedQty });

        if (matchedQty === buyer.qty) {
          await connection.query(`DELETE FROM pending_orders WHERE id = ?`, [buyer.id]);
        } else {
          await connection.query(`UPDATE pending_orders SET qty = ? WHERE id = ?`, [buyer.qty - matchedQty, buyer.id]);
        }

        remainingQty -= matchedQty;
      }

      if (remainingQty > 0) {
        await connection.query(
          `INSERT INTO pending_orders (type, qty, price) VALUES ('seller', ?, ?)`,
          [remainingQty, price]
        );
      }
    }

    await connection.commit();
    connection.release();

    //Final response logic
    if (completed.length > 0) {
      return res.json({
        success: true,
        message: "Order placed and matched",
        completed
      });
    } else {
      return res.json({
        success: true,
        message: "Order placed, waiting for match"
      });
    }

  } catch (err) {
    console.error("Order processing failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// export const placeOrder = async (req, res) => {
//   try {
//     const decrypted = req.body;
//     const { type, qty, price } = decrypted;

//     const connection = await pool.getConnection();
//     await connection.beginTransaction();

//     let remainingQty = qty;
//     const completed = [];

//     if (type === "buyer") {
//       const [sellers] = await connection.query(
//         `SELECT * FROM pending_orders WHERE type='seller' AND price <= ? ORDER BY price ASC FOR UPDATE`,
//         [price]
//       );

//       for (const seller of sellers) {
//         if (remainingQty <= 0) break;
//         const matchedQty = Math.min(remainingQty, seller.qty);

//         await connection.query(`INSERT INTO completed_orders (price, qty) VALUES (?, ?)`, [seller.price, matchedQty]);
//         completed.push({ price: seller.price, qty: matchedQty });

//         if (matchedQty === seller.qty) {
//           await connection.query(`DELETE FROM pending_orders WHERE id = ?`, [seller.id]);
//         } else {
//           await connection.query(`UPDATE pending_orders SET qty = ? WHERE id = ?`, [seller.qty - matchedQty, seller.id]);
//         }

//         remainingQty -= matchedQty;
//       }

//       if (remainingQty > 0) {
//         await connection.query(
//           `INSERT INTO pending_orders (type, qty, price) VALUES ('buyer', ?, ?)`,
//           [remainingQty, price]
//         );
//       }
//     } else if (type === "seller") {
//       const [buyers] = await connection.query(
//         `SELECT * FROM pending_orders WHERE type='buyer' AND price >= ? ORDER BY price DESC FOR UPDATE`,
//         [price]
//       );

//       for (const buyer of buyers) {
//         if (remainingQty <= 0) break;
//         const matchedQty = Math.min(remainingQty, buyer.qty);

//         await connection.query(`INSERT INTO completed_orders (price, qty) VALUES (?, ?)`, [buyer.price, matchedQty]);
//         completed.push({ price: buyer.price, qty: matchedQty });

//         if (matchedQty === buyer.qty) {
//           await connection.query(`DELETE FROM pending_orders WHERE id = ?`, [buyer.id]);
//         } else {
//           await connection.query(`UPDATE pending_orders SET qty = ? WHERE id = ?`, [buyer.qty - matchedQty, buyer.id]);
//         }

//         remainingQty -= matchedQty;
//       }

//       if (remainingQty > 0) {
//         await connection.query(
//           `INSERT INTO pending_orders (type, qty, price) VALUES ('seller', ?, ?)`,
//           [remainingQty, price]
//         );
//       }
//     }

//     await connection.commit();
//     connection.release();

//     //Final response logic
//     if (completed.length > 0) {
//       return res.json({
//         success: true,
//         message: "Order placed and matched",
//         completed
//       });
//     } else {
//       return res.json({
//         success: true,
//         message: "Order placed, waiting for match"
//       });
//     }

//   } catch (err) {
//     console.error("Order processing failed:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

export const getPendingOrders = async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM pending_orders ORDER BY created_at ASC`);
  res.json(rows);
};

export const getCompletedOrders = async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM completed_orders ORDER BY created_at DESC`);
  res.json(rows);
};
