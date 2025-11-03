import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3000;

app.use(express.static(".")); // serve index.html

app.post("/verify", upload.single("proof"), async (req, res) => {
  if (!req.file) return res.json({ ok: false, message: "No file" });

  const imagePath = path.resolve(req.file.path);

  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, "eng");
    console.log("OCR text:", text);

    // Keywords you want to detect in screenshot
    const keywords = ["kerala_booster", "Following"];

    const matched = keywords.some(k => text.toLowerCase().includes(k.toLowerCase()));

    fs.unlinkSync(imagePath); // delete after checking

    if (matched) {
      return res.json({ ok: true, redirect: "https://your-official-website.com" });
    } else {
      return res.json({ ok: false, message: "Text not matched" });
    }

  } catch (err) {
    console.error(err);
    return res.json({ ok: false, message: "OCR failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));