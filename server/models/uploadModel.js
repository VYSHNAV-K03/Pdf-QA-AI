const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pdfPath: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  qna: [
    {
      question: String,
      answer: String,
    },
  ],
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Upload", uploadSchema);
