// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { body, validationResult } from "express-validator";

// const router = express.Router();

// const usersRoutes = (pool) => {
//   // Register a new user
//   router.post(
//     "/register",
//     [
//       body("username").notEmpty().withMessage("Username is required"),
//       body("email").isEmail().withMessage("Valid email is required"),
//       body("password")
//         .isLength({ min: 6 })
//         .withMessage("Password must be at least 6 characters"),
//     ],
//     async (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { username, email, password } = req.body;

//       try {
//         // Check if the user already exists
//         const userEmailExists = await pool.query(
//           "SELECT id FROM users WHERE email=$1",
//           [email]
//         );
//         const usernameExists = await pool.query(
//           "SELECT id FROM users WHERE username=$1",
//           [username]
//         );
//         if (userEmailExists.rows.length > 0) {
//           return res.status(400).json({ error: "Email already exists" });
//         }
//         if (usernameExists.rows.length > 0) {
//           return res.status(400).json({ error: "User already exists" });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert user into the database
//         const result = await pool.query(
//           "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
//           [username, email, hashedPassword]
//         );

//         res.status(201).json({ user: result.rows[0] });
//       } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ error: "Internal Server Error" });
//       }
//     }
//   );

//   // User login
//   router.post(
//     "/login",
//     [
//       body("email").isEmail().withMessage("Valid emial is required"),
//       body("password").notEmpty().withMessage("Password is requried"),
//     ],
//     async (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const { email, password } = req.body;

//       try {
//         // Fetch user from the database
//         const userResult = await pool.query(
//           "SELECT * FROM users WHERE email = $1",
//           [email]
//         );
//         if (userResult.rows.length === 0) {
//           return res.status(401).json({ error: "Invalid email or password" });
//         }
//         const user = userResult.rows[0];

//         // Compare passwords
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//           return res.status(401).json({ error: "Invalid email or password" });
//         }

//         // Generate JWT
//         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
//           expiresIn: "1h",
//         });

//         res.status(200).json({ token });
//       } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ error: "Internal Server Error" });
//       }
//     }
//   );
//   return router;
// };

// export default usersRoutes;

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const router = express.Router();

const MIN_PASSWORD_LENGTH = 6;

const usersRoutes = (pool) => {
  // Register a new user
  router.post(
    "/register",
    [
      body("username").notEmpty().withMessage("Username is required"),
      body("email").isEmail().withMessage("Valid email is required"),
      body("password")
        .isLength({ min: MIN_PASSWORD_LENGTH })
        .withMessage(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
        ),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      try {
        // Check if the user already exists
        const userEmailExists = await pool.query(
          "SELECT id FROM users WHERE email=$1",
          [email]
        );
        const usernameExists = await pool.query(
          "SELECT id FROM users WHERE username=$1",
          [username]
        );
        if (userEmailExists.rows.length > 0) {
          return res.status(400).json({ error: "Email already exists" });
        }
        if (usernameExists.rows.length > 0) {
          return res.status(400).json({ error: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const result = await pool.query(
          "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
          [username, email, hashedPassword]
        );

        res.status(201).json({ user: result.rows[0] });
      } catch (err) {
        console.error("Error occurred during user registration:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  // User login
  router.post(
    "/login",
    [
      body("email").isEmail().withMessage("Valid email is required"),
      body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        // Fetch user from the database
        const userResult = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (
          userResult.rows.length === 0 ||
          !(await bcrypt.compare(password, userResult.rows[0].password))
        ) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.status(200).json({ token });
      } catch (err) {
        console.error("Error occurred during user login:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  return router;
};

export default usersRoutes;
