import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import RouteMap from "./RouteMap.jsx";
import ClusterGraph from "./ClusterGraph.jsx";
import { ErrorBoundary } from "./ErrorBoundary.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Check Auth on mount
  useEffect(() => {
    const savedLogin = localStorage.getItem("loggedIn");
    if (savedLogin === "true") {
      setLoggedIn(true);
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("loggedIn", "true");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setLoggedIn(false);
  };

  // 2. Prevent White Screen during initial auth check
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Initializing Trade Map UI...</p>
      </div>
    );
  }

  // 3. Gate the app with Login
  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Navigation Bar */}
        <nav
          style={{
            padding: "12px 20px",
            background: "#fff",
            borderBottom: "1px solid #ddd",
            zIndex: 1000,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <Link to="/" style={{ marginRight: 20, fontWeight: "bold", textDecoration: "none", color: "#0074D9" }}>
              Route Map
            </Link>
            <Link to="/cluster" style={{ fontWeight: "bold", textDecoration: "none", color: "#0074D9" }}>
              Cluster Graph
            </Link>
          </div>
          <button 
            onClick={handleLogout}
            style={{ padding: "5px 10px", cursor: "pointer", background: "#f4f4f4", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            Logout
          </button>
        </nav>

        {/* Main Content Area */}
        <div style={{ flex: 1, position: "relative" }}>
          <Routes>
            <Route path="/" element={<RouteMap />} />
            <Route path="/cluster" element={<ClusterGraph />} />
            {/* Catch-all: Redirects any unknown route back to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;