import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vercel/Vite uses import.meta.env, NOT process.env
    // Ensure VITE_APP_PASSWORD is set in your Vercel Dashboard
    const correctPassword = import.meta.env.VITE_APP_PASSWORD || "admin123";

    if (password === correctPassword) {
      setError("");
      onLogin(); // Notifies App.jsx to update loggedIn state
    } else {
      setError("Incorrect password. Access denied.");
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0f2f5",
      fontFamily: "sans-serif"
    }}>
      <form 
        onSubmit={handleSubmit} 
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center"
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#1a1a1a" }}>Trade Map Access</h2>
        <p style={{ marginBottom: "25px", color: "#666", fontSize: "14px" }}>
          Please enter the administrative password to continue.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "16px",
            boxSizing: "border-box"
          }}
        />

        {error && (
          <p style={{ color: "#d93025", fontSize: "14px", marginBottom: "15px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#0074D9",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#005bb5"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#0074D9"}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}