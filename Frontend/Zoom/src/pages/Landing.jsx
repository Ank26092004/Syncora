import React, { useState } from "react";
import "./landing.css";
import { Link, useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const token = localStorage.getItem("token");

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      navigate(`/${meetingCode.trim()}`);
    }
  };

  const handleJoinAsGuest = () => {
    const randomCode = Math.random().toString(36).substring(2, 8);
    navigate(`/${randomCode}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <>
      <div className="landingPageContainer">
        <nav>
          <div className="navHeader">
            <h2>Syncora</h2>
          </div>
          <div className="navList">
            <p onClick={handleJoinAsGuest} style={{ cursor: "pointer" }}>
              Join as Guest
            </p>
            {!token ? (
              <>
                <p onClick={() => navigate("/auth")} style={{ cursor: "pointer" }}>
                  Register
                </p>
                <div role="button" onClick={() => navigate("/auth")} style={{ cursor: "pointer" }}>
                  <p>Login</p>
                </div>
              </>
            ) : (
              <div role="button" onClick={handleLogout} style={{ cursor: "pointer" }}>
                <p>Logout</p>
              </div>
            )}
          </div>
        </nav>

        <div className="landingMainContainer">
          <div>
            <h1>
              <span style={{ color: "#FF9839" }}>Connect</span> with your loved
              Ones
            </h1>
            <p>Cover a distance by Syncora</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Enter Meeting Code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "1rem"
                }}
              />
              <button
                onClick={handleJoinMeeting}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  backgroundColor: "#FF9839",
                  color: "#fff",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Join
              </button>
            </div>
            <div role="button" style={{ marginTop: "20px" }}>
              <Link to={"/auth"}>Get Started</Link>
            </div>
          </div>
          <div>
            <img src="/mobile.png" alt="image" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
