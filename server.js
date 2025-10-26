import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import AWS from "aws-sdk";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const db = new sqlite3.Database("./data.db");

AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

app.use(bodyParser.json());
app.use(express.static("public"));

// Initialize DB if not exists
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  price_cents INTEGER,
  s3_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Admin auth (simple header password)
app.use("/admin", (req, res, next) => {
  if (req.path === "/upload" || req.path === "/list") {
    const pass = req.headers["x-admin-pass"];
    if (pass !== process.env.ADMIN_PASSWORD) {
      return res.status(403).send("Forbidden");
    }
  }
  next();
});

// Admin upload endpoint
app.post("/admin/upload", upload.single("file"), async (req, res) => {
  const { title, slug, description, price_cents } = req.body;
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const key = `products/${slug}/${Date.now()}_${file.originalname}`;
  await s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();

  db.run(
    `INSERT INTO products (title, slug, description, price_cents, s3_key)
     VALUES (?, ?, ?, ?, ?)`,
    [title, slug, description, price_cents || 0, key],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ success: true, id: this.lastID });
    }
  );
});

// List products for admin
app.get("/admin/list", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Public list
app.get("/api/products", (req, res) => {
  db.all("SELECT id, title, slug, description, price_cents FROM products", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Product detail
app.get("/api/products/:slug", (req, res) => {
  db.get("SELECT * FROM products WHERE slug = ?", [req.params.slug], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).send("Not found");
    res.json(row);
  });
});

// Generate download link (after PayPal verification)
app.post("/api/download", async (req, res) => {
  const { slug } = req.body;
  db.get("SELECT s3_key FROM products WHERE slug = ?", [slug], async (err, row) => {
    if (err || !row) return res.status(404).send("Not found");
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET,
      Key: row.s3_key,
      Expires: 60 * 60,
    });
    res.json({ url });
  });
});

app.listen(3000, () => console.log("Little Japan server running on port 3000"));
