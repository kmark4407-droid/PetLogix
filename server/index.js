import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
const prisma = new PrismaClient();

// ----------------- SETUP -----------------

// Make sure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Serve uploaded files
app.use("/uploads", express.static(UPLOAD_DIR));

// Enable CORS for Next.js client
app.use(cors({ origin: "http://localhost:3000" }));

// Parse JSON bodies for routes without file uploads
app.use(express.json());

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// ----------------- ROUTES -----------------

// GET all pets
app.get("/api/pets", async (req, res) => {
  try {
    const pets = await prisma.petlogix.findMany({
      orderBy: { id: "desc" },
    });
    res.json({ success: true, pets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new pet (with optional file upload)
app.post("/api/pets", upload.single("image"), async (req, res) => {
  try {
    const { name, owner, address, contact, species, breed } = req.body;

    if (!name || !owner) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Owner are required." });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const pet = await prisma.petlogix.create({
      data: { name, owner, address, contact, species, breed, imageUrl },
    });

    res.json({ success: true, pet, message: "✅ Pet added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update pet (with optional file upload)
app.put("/api/pets/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, owner, address, contact, species, breed } = req.body;

    if (!name || !owner) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Owner are required." });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const pet = await prisma.petlogix.update({
      where: { id: Number(id) },
      data: { name, owner, address, contact, species, breed, ...(imageUrl && { imageUrl }) },
    });

    res.json({ success: true, pet, message: "✏️ Pet updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE pet
app.delete("/api/pets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.petlogix.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "🗑️ Pet deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
