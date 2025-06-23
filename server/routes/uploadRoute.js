const express = require("express");
const upload = require("../config/multerConfig");
const uploadModel = require("../models/uploadModel");

const router = express.Router();

router.post(
  "/upload",
  upload.fields([{ name: "pdf" }, { name: "images" }]),
  async (req, res) => {
    try {
      const { summary, userId } = req.body;

      const qna = req.body.qna ? JSON.parse(req.body.qna) : [];
      console.log("summary");

      const pdfPath = req.files["pdf"] ? req.files["pdf"][0].path : null;
      const imagePaths = req.body.images ? JSON.parse(req.body.images) : [];

      console.log("PDF Path:", pdfPath);
      console.log("Image Paths:", imagePaths);
      console.log("QNA:", qna);
      console.log("Summary:", summary);
      console.log("User ID:", userId);

      const newUpload = new uploadModel({
        userId,
        pdfPath,
        summary,
        qna,
        images: imagePaths,
      });

      await newUpload.save();

      console.log("Data uploaded successfully.", newUpload);

      res.status(201).json({ message: "Data uploaded successfully." });
    } catch (error) {
      console.error("Error uploading data:", error);
      res.status(500).json({ error: "Error uploading data." });
    }
  }
);

// Get uploads by user ID
router.get("/uploads/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const uploads = await uploadModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(uploads);
  } catch (error) {
    console.error("Error fetching user uploads:", error);
    res.status(500).json({ error: "Error fetching user uploads." });
  }
});

module.exports = router;
