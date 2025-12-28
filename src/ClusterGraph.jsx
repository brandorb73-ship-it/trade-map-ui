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
          // Label is now the full name; CSS handles the wrapping
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
              "width": "label", // This makes node width match text length
              "height": "label", // This makes node height match text height
              "padding": "10px",
              "background-color": "#0074D9",
              "color": "#fff",
              "text-valign": "center",
              "text-halign": "center",
              "font-size": 10,
              "text-wrap": "wrap",
              "text-max-width": "100px",
              "shape": "round-rectangle"
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

      {/* --- BIGGER TABLE ON THE RIGHT --- */}
      {displayedShipment && (
        <div style={{
          position: "absolute", top: 20, right: 20, zIndex: 1000,
          background: "white", padding: "20px", borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)", 
          width: "450px", // Increased width
          maxHeight: "85vh", overflowY: "auto"
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
             <h3 style={{ margin: 0 }}>Trade Details</h3>
             <button 
                onClick={() => setLockedShipment(lockedShipment ? null : hoveredShipment)}
                style={{
                    padding: "5px 15px", borderRadius: "20px", border: "none",
                    background: lockedShipment ? "#FF4136" : "#2ECC40", color: "white", cursor: "pointer"
                }}
             >
                {lockedShipment ? "Unlock" : "Lock"}
             </button>
          </div>
          <InfoTable shipment={displayedShipment} />
          <button 
            onClick={() => {setLockedShipment(null); setHoveredShipment(null);}}
            style={{ marginTop: "15px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
