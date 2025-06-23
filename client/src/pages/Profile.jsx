import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { BsFilePdf } from "react-icons/bs";

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/user/uploads/${user.id}`
        );
        setUploads(response.data);
      } catch (error) {
        console.error("Error fetching uploads:", error);
      }
    };

    if (user) {
      fetchUploads();
    }
  }, [user]);

  const handleViewPDF = (pdfPath) => {
    const pdfUrl = `http://localhost:7000/${pdfPath}`;
    window.open(pdfUrl, "_blank");
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="container py-4">
      {/* Profile Section */}
      <div className="d-flex align-items-center bg-light border rounded p-3 mb-4 shadow-sm">
        <div
          className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
          style={{ width: "70px", height: "70px", fontSize: "30px" }}
        >
          {getInitials(user.username)}
        </div>
        <div>
          <h4 className="mb-1">{user.username}</h4>
          <p className="mb-1 text-muted">Email: {user.email}</p>
          <p className="mb-1 text-muted">Phone: {user.phone}</p>
          <p className="mb-1 text-muted">Role: {user.role}</p>
        </div>
      </div>

      {/* Uploads Section */}
      <h3 className="mb-3">Uploads</h3>
      {uploads.length > 0 ? (
        <div className="row g-3">
          {uploads.map((upload, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <BsFilePdf className="text-danger me-2" size={24} />
                    <h6 className="mb-0">Upload ID: {upload._id}</h6>
                  </div>
                  <hr />
                  <p className="mb-2">
                    <strong>Summary:</strong> {upload.summary}
                  </p>

                  <h6>Q&A:</h6>
                  {upload.qna.length > 0 ? (
                    <div className="mb-2">
                      {upload.qna.map((qna, i) => (
                        <div key={i} className="mb-1">
                          <strong>Q:</strong> {qna.question} <br />
                          <strong>A:</strong> {qna.answer}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No Q&A available.</p>
                  )}

                  <h6>Images:</h6>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {upload.images.length > 0 ? (
                      upload.images.map((image, i) => (
                        <img
                          key={i}
                          src={`http://127.0.0.1:5000/${image}`}
                          alt={`img-${i}`}
                          className="img-thumbnail"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-muted">No images available.</p>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => handleViewPDF(upload.pdfPath)}
                  >
                    View PDF
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">No uploads found.</div>
      )}
    </div>
  );
};

export default Profile;
