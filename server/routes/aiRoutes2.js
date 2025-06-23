const express = require("express");
const router = express.Router();
const axios = require("axios");

const COHERE_API_URL = "https://api.cohere.ai/v1/generate";
const API_KEY = "7Dbjk8G3UCx4QSkXxuApvNpPH4AFKaW1aOy743z3"; // Secure this

// Function to split large text into chunks
function splitIntoChunks(text, maxChunkSize = 2000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.substring(start, start + maxChunkSize));
    start += maxChunkSize;
  }
  return chunks;
}

router.post("/api/answer", async (req, res) => {
  try {
    const { context, question } = req.body;

    const chunks = splitIntoChunks(context); // Split large document
    const allAnswers = [];

    for (const chunk of chunks) {
      const prompt = `Given the following paragraph:\n"${chunk}"\nAnswer the question: "${question}"`;

      const response = await axios.post(
        COHERE_API_URL,
        {
          model: "command",
          prompt: prompt,
          max_tokens: 200,
          temperature: 0.3,
        },
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );

      const answer = response.data.generations[0].text.trim();
      allAnswers.push(answer);
    }

    // Option 1: Combine all answers
    const finalAnswer = allAnswers.join(" ");

    res.json({ answer: finalAnswer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching answer from Cohere" });
  }
});

module.exports = router;
