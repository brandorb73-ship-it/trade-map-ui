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
    fetch(url).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setShipments(data);
      setLoading(false);
    });
  }, []);

  const elements = useMemo(() => {
    if (!shipments.length) return [];
    const nodesMap = {};
    const edges = [];

    shipments.forEach((s, i) => {
      const origin = s["Origin Country"] || s["Origin Country "];
      const destination = s["Destination Country"];
      const exporter = s["Exporter"];
      const product = s["Description"];

      if (!origin || !destination) return;

      [origin, destination, exporter, product].forEach(name => {
        if (name && !nodesMap[name]) {
          nodesMap[name] = { data: { id: name, label: name } };
        }
      });

      if (origin && product) edges.push({ data: { id: `e1-${i}`, source: origin, target: product, shipment: s, color: s.COLOR || "red" } });
      if (exporter && product) edges.push({ data: { id: `e2-${i}`, source: exporter, target: product, shipment: s, color: s.COLOR || "red" } });
      if (product && destination) edges.push({ data: { id: `e3-${i}`, source: product, target: destination, shipment: s, color: s.COLOR || "red" } });
    });
    return [...Object.values(nodesMap), ...edges];
  }, [shipments]);

  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      cyRef.current.layout({ name: "cose", animate: false, padding: 50 }).run();
      cyRef.current.fit();
    }
  }, [elements]);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", background: "#f8f9fa" }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        cy={(cy) => {
          cyRef.current = cy;
          cy.on("mouseover", "edge", (e) => { if(!lockedShipment) setHoveredShipment(e.target.data("shipment")) });
          cy.on("mouseout", "edge", () => { if(!lockedShipment) setHoveredShipment(null) });
          cy.on("click", "edge", (e) => { setLockedShipment(e.target.data("shipment")) });
        }}
        stylesheet={[
          { selector: "node", style: { label: "data(label)", width: "label", height: "label", padding: "10px", "background-color": "#0074D9", color: "#fff", "text-valign": "center", "font-size": "10px", shape: "round-rectangle" } },
          { selector: "edge", style: { width: 3, "line-color": "data(color)", "target-arrow-color": "data(color)", "target-arrow-shape": "triangle", "curve-style": "bezier" } }
        ]}
      />

      {/* TABLE ON THE LEFT */}
      {displayedShipment && (
        <div style={{ position: "absolute", top: "20px", left: "20px", width: "450px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 1000 }}>
          <InfoTable shipment={displayedShipment} />
        </div>
      )}

      {/* BUTTONS ON THE RIGHT */}
      {displayedShipment && (
        <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 1000 }}>
          <button 
            onClick={() => setLockedShipment(lockedShipment ? null : hoveredShipment)}
            style={{ padding: "15px 25px", background: lockedShipment ? "#FF4136" : "#2ECC40", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
          >
            {lockedShipment ? "🔓 Unlock Table" : "🔒 Lock Table"}
          </button>
          <button onClick={() => {setLockedShipment(null); setHoveredShipment(null);}} style={{ padding: "10px", background: "#eee", border: "none", borderRadius: "8px", cursor: "pointer" }}>Clear Selection</button>
        </div>
      )}
    </div>
  );
}
