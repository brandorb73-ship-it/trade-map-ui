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

  const cleanString = (str) => (str ? str.toString().replace(/\u200B/g, "").trim() : "");

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
      const origin = cleanString(s["Origin Country "] || s["Origin Country"]);
      const destination = cleanString(s["Destination Country"]);
      const exporter = cleanString(s["Exporter"]);
      const product = cleanString(s["Description"]);

      if (!origin || !destination) return;
      const color = s["COLOR"]?.trim() || "#FF4136";

      [origin, destination, exporter, product].forEach((name) => {
        if (name && !nodesMap[name]) {
          nodesMap[name] = { data: { id: name, label: name } };
        }
      });

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
    }
  }, [elements]);

  if (loading) return <div style={{ padding: "20px" }}>Loading Graph...</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%", background: "#f8f9fa", overflow: "hidden" }}>
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
              "width": "label", // Shrink/Grow width to fit text
              "height": "label", // Shrink/Grow height to fit text
              "padding": "12px", // Space inside the blue box
              "background-color": "#0074D9",
              "color": "#fff",
              "text-valign": "center",
              "text-halign": "center",
              "font-size": "10px",
              "text-wrap": "wrap",
              "text-max-width": "120px",
              "shape": "round-rectangle",
              "border-width": 2,
              "border-color": "#005bb5"
            },
          },
          {
            selector: "edge",
            style: {
              width: 4,
              "line-color": "data(lineColor)",
              "target-arrow-color": "data(lineColor)",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              opacity: 0.8,
            },
          },
        ]}
      />

      {/* --- ENLARGED TABLE ON THE RIGHT --- */}
      {displayedShipment && (
        <div style={{
          position: "absolute", top: "20px", right: "20px", zIndex: 1000,
          background: "white", padding: "25px", borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)", 
          width: "500px", // Wider as requested
          maxHeight: "85vh", overflowY: "auto",
          border: "1px solid #eee"
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
             <h2 style={{ margin: 0, fontSize: '18px' }}>Trade Record</h2>
             <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={() => setLockedShipment(lockedShipment ? null : hoveredShipment)}
                    style={{
                        padding: "6px 15px", borderRadius: "6px", border: "none",
                        background: lockedShipment ? "#FF4136" : "#2ECC40", color: "white", cursor: "pointer", fontWeight: 'bold'
                    }}
                >
                    {lockedShipment ? "Unlock" : "Lock"}
                </button>
                <button onClick={() => {setLockedShipment(null); setHoveredShipment(null);}} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
             </div>
          </div>
          <hr style={{ marginBottom: '15px', border: '0.5px solid #eee' }} />
          <InfoTable shipment={displayedShipment} />
        </div>
      )}
    </div>
  );
}
