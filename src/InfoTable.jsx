import React from "react";

export default function InfoTable({ shipment, locked }) {
  // If no shipment is hovered or clicked, render nothing
  if (!shipment) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "80px", // Pushed down to avoid overlapping the Nav bar
        right: "20px",
        width: "320px",
        maxHeight: "70vh", // Prevents the table from going off-screen on small laptops
        overflowY: "auto",  // Adds a scrollbar if the data is too long
        background: "white",
        border: "1px solid #ddd",
        padding: "15px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        borderRadius: "8px",
        pointerEvents: "auto" // Ensures you can click inside the table to scroll
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: "18px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        Shipment Details {locked ? "📌" : ""}
      </h3>

      <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
        <tbody>
          {[
            { label: "Product", key: "Product" },
            { label: "Date", key: "Date" },
            { label: "Transport", key: "Mode of Transport" },
            { label: "Exporter", key: "Exporter" },
            { label: "Importer", key: "Importer" },
            { label: "Origin", key: "Origin Country" },
            { label: "Destination", key: "Destination Country" },
          ].map((item) => (
            <tr key={item.key} style={{ borderBottom: "1px solid #f9f9f9" }}>
              <td style={{ padding: "8px 4px", fontWeight: "bold", color: "#555", width: "40%" }}>
                {item.label}
              </td>
              <td style={{ padding: "8px 4px", color: "#333", wordBreak: "break-word" }}>
                {shipment[item.key] || "N/A"} 
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {locked && (
        <p style={{ fontSize: "10px", color: "#888", marginTop: "10px", fontStyle: "italic" }}>
          Click "Unlock" or another edge to clear selection.
        </p>
      )}
    </div>
  );
}