import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const envValue = import.meta.env.VITE_APP_PASSWORD;
    
    // DEBUG LOGS - Open your browser console (F12) to see these
    console.log("Input Password:", password);
    console.log("VITE_APP_PASSWORD from Env:", envValue);

    if (!envValue) {
      setError("CRITICAL: Vercel Env Variable is UNDEFINED. Defaulting to 'admin123'");
    }

    const finalCorrectPassword = envValue || "admin123";

    if (password === finalCorrectPassword) {
      setError("");
      onLogin();
    } else {
      setError(`Access Denied. Tip: Ensure no spaces at the end of your password.`);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f2f5", fontFamily: "sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "10px" }}>Trade Map Access</h2>
        
        {/* TEMPORARY DEBUG TEXT - REMOVE AFTER FIXING */}
        <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '10px' }}>
          DEBUG: App is looking for: {import.meta.env.VITE_APP_PASSWORD ? "Vercel Secret" : "Default admin123"}
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          style={{ width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ddd" }}
        />

        {error && <p style={{ color: "#d93025", fontSize: "13px", marginBottom: "15px" }}>{error}</p>}

        <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#0074D9", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}
