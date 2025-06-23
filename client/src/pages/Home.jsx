import React, { useEffect } from "react";
import axios from "axios";

const Home = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white"
      style={{
        backgroundImage: `url("https://img.swifdoo.com/image/ai-pdf-analyzer.png")`,
        backgroundSize: "cover",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="text-center bg-secondary bg-opacity-75 p-5 rounded">
        <h1 className="display-4 fw-bold mb-4">PDF Analyzer</h1>
        <p className="lead mb-4">
          Analyze and extract data from PDF files with precision and speed.
        </p>
        <a href="/login" className="btn btn-primary">
          Get Started
        </a>
      </div>
    </div>
  );
};

export default Home;
