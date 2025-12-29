import React, { useEffect, useState, useRef, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import InfoTable from "./InfoTable.jsx";

export default function ClusterGraph() {
  const [shipments, setShipments] = useState([]);
  const [hoveredShipment, setHoveredShipment] = useState(null);
  const [lockedShipment, setLockedShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const cyRef = useRef(null);
  const displayedShipment = lockedShipment || hoveredShipment;

  useEffect(() => {
    const url = import.meta.env.VITE_SHEET_API_URL;
    if (!url) return;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setShipments(data);
        setLoading(false);
      })
      .catch((err) => { console.error("Fetch error:", err); setLoading(false); });
  }, []);

  const elements = useMemo(() => {
    if (!shipments.length) return [];
    const nodesMap = {};
    const edges = [];

    shipments.forEach((s, i) => {
      // Reverting to the exact key logic that worked for your links
      const origin = s["Origin Country"] || s["Origin Country "]; 
      const destination = s["Destination Country"];
      const exporter = s["Exporter"];
      const product = s["Description"];

      if (!origin || !destination) return;
      const color = s["COLOR"] || "#FF4136";

      // Build Nodes
      [origin, destination, exporter, product].forEach((name) => {
        if (name && !nodesMap[name]) {
          nodesMap[name] = { data: { id: name, label: name } };
        }
      });

      // Build Edges (The Links)
      if (origin && product)
        edges.push({ data: { id: `e1-${i}`, source: origin, target: product, shipment: s, lineColor: color } });
      if (exporter && product)
        edges.push({ data: { id: `e2-${i}`, source: exporter, target: product, shipment: s, lineColor: color } });
      if (product && destination)
        edges.push({ data: { id: `e3-${i}`, source: product, target: destination, shipment: s, lineColor: color } });
    });

    return [...Object.values(nodesMap), ...edges];
  }, [shipments]);

  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      cyRef.current.layout({ name: "cose", animate: false, padding: 50 }).run();
      cyRef.current.fit();
    }
  }, [elements]);

  if (loading) return <div style={{ padding: "20px" }}>Loading Graph...</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", background: "#f8f9fa" }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        cy={(cy) => {
          cyRef.current = cy;
          cy.off("mouseover click");
          cy.on("mouseover", "edge", (evt) => { if (!lockedShipment) setHoveredShipment(evt.target.data("shipment")); });
          cy.on("mouseout", "edge", () => { if (!lockedShipment) setHoveredShipment(null); });
          cy.on("click", "edge", (evt) => { setLockedShipment(evt.target.data("shipment")); });
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              label: "data(label)",
              "width": "label",
              "height": "label",
              "padding": "15px",
              "background-color": "#0074D9",
              "color": "#fff",
              "text-valign": "center",
              "text-halign": "center",
              "font-size": "12px",
              "shape": "round-rectangle",
            },
          },
          {
            selector: "edge",
            style: {
              width: 3,
              "line-color": "data(lineColor)",
              "target-arrow-color": "data(lineColor)",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              opacity: 0.8,
            },
          },
        ]}
      />

      {/* --- BIGGER TABLE ON THE LEFT --- */}
      {displayedShipment && (
        <div style={{
          position: "absolute", top: "20px", left: "20px", zIndex: 1000,
          background: "white", padding: "20px", borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)", width: "450px", 
          maxHeight: "85vh", overflowY: "auto"
        }}>
          <h3 style={{ marginTop: 0 }}>Shipment Data</h3>
          <InfoTable shipment={displayedShipment} />
        </div>
      )}

      {/* --- BUTTONS ON THE RIGHT --- */}
      {displayedShipment && (
        <div style={{
          position: "absolute", top: "20px", right: "20px", zIndex: 1000,
          display: "flex", flexDirection: "column", gap: "10px"
        }}>
          <button 
            onClick={() => setLockedShipment(lockedShipment ? null : hoveredShipment)}
            style={{
              padding: "12px 24px", borderRadius: "8px", border: "none",
              background: lockedShipment ? "#FF4136" : "#2ECC40", 
              color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "14px"
            }}
          >
            {lockedShipment ? "🔓 Unlock Table" : "🔒 Lock Table"}
          </button>
          
          <button 
            onClick={() => { setLockedShipment(null); setHoveredShipment(null); }}
            style={{
              padding: "10px", borderRadius: "8px", border: "1px solid #ccc",
              background: "white", cursor: "pointer"
            }}
          >
            Close / Clear
          </button>
        </div>
      )}
    </div>
  );
}
