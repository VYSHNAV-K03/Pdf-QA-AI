import React, { useState } from "react";
import axios from "axios";
import { Tab, Tabs } from "react-bootstrap";
import { FaGlobe, FaMicrophone } from "react-icons/fa";
import "animate.css";

const PdfQA = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [context, setContext] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("ml");
  const [isRecording, setIsRecording] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem("user")));
  // Add these new states at the top
  const [errorMessage, setErrorMessage] = useState("");
  const [isSummaryDone, setIsSummaryDone] = useState(false); // controls Q&A access

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const summarizePDF = async () => {
    if (!file) {
      setErrorMessage("Please upload a PDF file before summarizing.");
      return;
    }

    setLoading(true);
    setSummary("");
    setContext("");
    setErrorMessage("");
    setIsSummaryDone(false); // Reset when summarizing again

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axios.post(
        "http://localhost:7000/summarize",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setSummary(response.data.summary);
      setContext(response.data.fullText);
      setIsSummaryDone(true); // Allow Q&A after summary is done
    } catch (err) {
      console.error("Error summarizing PDF");
      setErrorMessage("Failed to summarize PDF. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question || !context) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/ask", {
        context,
        question,
      });
      setAnswer(response.data.answer);
      setQaHistory((prev) => [
        ...prev,
        { question, answer: response.data.answer },
      ]);
    } catch (err) {
      console.error("Error getting answer");
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text, language) => {
    const maxLength = 500;
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.slice(i, i + maxLength));
    }
    try {
      const translatedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          const response = await axios.post(
            "https://api.mymemory.translated.net/get",
            new URLSearchParams({
              q: chunk,
              langpair: `en|${language}`,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );
          return response.data.responseData.translatedText;
        })
      );
      const translatedText = translatedChunks.join(" ");
      setTranslatedText(translatedText);
      setTranslationHistory((prev) => [...prev, { text, translatedText }]);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Translation failed.");
    }
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    setIsRecording(true);
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuestion(speechResult);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      console.error("Voice recognition error");
      setIsRecording(false);
    };
  };

  const handleUploadImage = async () => {
    if (!file) return alert("Please select a PDF file.");
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData
      );
      setImages(response.data.images);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file.");

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("summary", summary);
    formData.append("userId", user.id);
    formData.append("qna", JSON.stringify(qaHistory));
    formData.append("images", JSON.stringify(images));

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:7000/api/user/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Upload successful:", response.data);
      alert("Upload successful.");
    } catch (error) {
      console.error("Error uploading data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <h2 className="text-center mb-5 animate__animated animate__zoomIn">
        📄 <span className="text-primary">PDF Analyzer</span> with AI QA
      </h2>

      <div className="mb-4">
        <input
          type="file"
          className="form-control shadow-sm"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </div>
      {errorMessage && (
        <div className="alert alert-danger mt-3 animate__animated animate__shakeX">
          {errorMessage}
        </div>
      )}

      <Tabs defaultActiveKey="summary" className="mb-3">
        <Tab eventKey="summary" title="📝 Summarization">
          <div className="text-center mb-3">
            <button
              className="btn btn-primary btn-lg animate__animated animate__pulse animate__infinite"
              onClick={summarizePDF}
              disabled={loading}
            >
              {loading ? "Processing..." : "Summarize PDF"}
            </button>
          </div>
          {summary && (
            <div className="card shadow-sm p-3 animate__animated animate__fadeInUp">
              <h5>📌 Summary:</h5>
              <p>{summary}</p>
            </div>
          )}
        </Tab>

        <Tab
          eventKey="qa"
          title="❓ Q&A"
          disabled={!isSummaryDone} // ✅ Disable unless summary is ready
        >
          <input
            type="text"
            className="form-control my-3 shadow-sm"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="d-flex align-items-center mb-3">
            <button className="btn btn-warning me-2" onClick={handleVoiceInput}>
              {isRecording ? "Listening..." : <FaMicrophone />} Voice Input
            </button>
            <button
              className="btn btn-success"
              onClick={askQuestion}
              disabled={loading}
            >
              {loading ? "Searching..." : "Get Answer"}
            </button>
          </div>
          {answer && (
            <div className="card p-3 animate__animated animate__fadeInUp">
              <h5>✅ Answer:</h5>
              <p>{answer}</p>
              <div className="d-flex align-items-center mb-2">
                <FaGlobe className="me-2 text-primary" />
                <select
                  className="form-select w-auto me-2"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="ml">Malayalam</option>
                  <option value="ta">Tamil</option>
                  <option value="kn">Kannada</option>
                  <option value="hi">Hindi</option>
                </select>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => translateText(answer, language)}
                >
                  Translate
                </button>
              </div>
              <p className="text-success fw-bold">{translatedText}</p>
            </div>
          )}
        </Tab>

        <Tab eventKey="images" title="🖼️ Extract Images">
          <div className="text-center">
            <button className="btn btn-info mb-4" onClick={handleUploadImage}>
              Extract Images
            </button>
            <div className="d-flex flex-wrap justify-content-center">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={`http://127.0.0.1:5000${img}`}
                  alt={`Extracted ${index}`}
                  className="img-thumbnail m-2 animate__animated animate__zoomIn"
                  style={{ width: "200px" }}
                />
              ))}
            </div>
          </div>
        </Tab>

        <Tab eventKey="upload" title="☁️ Upload">
          <div className="p-3">
            {summary && (
              <div className="mb-4">
                <h5>📌 Summary:</h5>
                <p>{summary}</p>
              </div>
            )}
            {qaHistory.map((item, index) => (
              <div key={index} className="border rounded p-2 mb-3 shadow-sm">
                <strong>Q:</strong> {item.question}
                <br />
                <strong>A:</strong> {item.answer}
              </div>
            ))}

            {images.length > 0 && (
              <div className="d-flex flex-wrap justify-content-start">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={`http://127.0.0.1:5000${img}`}
                    alt={`Extracted ${index}`}
                    className="img-thumbnail m-2"
                    style={{ width: "150px" }}
                  />
                ))}
              </div>
            )}

            <button
              className="btn btn-success mt-4 w-100"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Data"}
            </button>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default PdfQA;
