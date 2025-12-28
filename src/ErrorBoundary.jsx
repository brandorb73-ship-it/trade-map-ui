import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // This will show up in your Vercel logs/Browser console
    console.error("Critical Render Error:", error, errorInfo);
  }

  handleReset = () => {
    // Clears the error state and tries to re-render
    this.setState({ hasError: false, error: null });
    // Or hard refresh if the error is persistent
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          fontFamily: "sans-serif",
          color: "#333",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh"
        }}>
          <h1 style={{ color: "#d93025" }}>Visualization Error</h1>
          <p>The map or graph encountered a data problem.</p>
          
          <div style={{ 
            background: "#f8f9fa", 
            padding: "15px", 
            borderRadius: "8px", 
            fontSize: "12px",
            color: "#666",
            maxWidth: "80%",
            overflowX: "auto",
            marginBottom: "20px",
            border: "1px solid #ddd"
          }}>
            <code>{this.state.error?.message || "Unknown Error"}</code>
          </div>

          <button 
            onClick={this.handleReset}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0074D9",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Try to Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}