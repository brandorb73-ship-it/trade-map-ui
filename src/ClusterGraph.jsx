import React, { useEffect, useState, useRef, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import InfoTable from "./InfoTable.jsx"; // Import the proper table component

export default function ClusterGraph() {
  const [shipments, setShipments] = useState([]);
  const [hoveredShipment, setHoveredShipment] = useState(null);
  const [lockedShipment, setLockedShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const cyRef = useRef(null);

  const cleanString = (str) => (str ? str.toString().replace(/\u200B/g, "").trim() : "");
  const truncateLabel = (name, maxLength = 25) =>
    name.length > maxLength ? name.slice(0, maxLength) + "…" : name;

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
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
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
          nodesMap[name] = { data: { id: name, label: truncateLabel(name) } };
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
      cyRef.current.fit();
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
          cy.on("mouseover", "edge", (evt) => {
            if (!lockedShipment) setHoveredShipment(evt.target.data("shipment"));
          });
          cy.on("mouseout", "edge", () => {
            if (!lockedShipment) setHoveredShipment(null);
          });
          cy.on("click", "edge", (evt) => {
            setLockedShipment(evt.target.data("shipment"));
          });
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              label: "data(label)",
              width: 60,
              height: 40,
              "background-color": "#0074D9",
              color: "#fff",
              "text-valign": "center",
              "text-halign": "center",
              "font-size": 8,
              "text-wrap": "wrap",
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

      {/* --- TABLE ON THE LEFT --- */}
      {displayedShipment && (
        <div style={{
          position: "absolute", top: 20, left: 20, zIndex: 1000,
          background: "white", padding: "15px", borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", width: "380px",
          maxHeight: "85vh", overflowY: "auto"
        }}>
          <h4 style={{ marginBottom: "10px" }}>Shipment Details</h4>
          <InfoTable shipment={displayedShipment} />
        </div>
      )}

      {/* --- BUTTONS ON THE RIGHT --- */}
      {displayedShipment && (
        <div style={{
          position: "absolute", top: 20, right: 20, zIndex: 1000,
          display: "flex", flexDirection: "column", gap: "10px"
        }}>
          <button 
            onClick={() => {
                if (lockedShipment) {
                    setLockedShipment(null);
                } else {
                    setLockedShipment(hoveredShipment);
                }
            }} 
            style={{
              padding: "10px 20px", cursor: "pointer", borderRadius: "5px",
              border: "none", background: lockedShipment ? "#FF4136" : "#2ECC40",
              color: "white", fontWeight: "bold", boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}
          >
            {lockedShipment ? "🔓 Unlock Table" : "🔒 Lock Table"}
          </button>

          <button 
            onClick={() => { setLockedShipment(null); setHoveredShipment(null); }}
            style={{
              padding: "10px 20px", cursor: "pointer", borderRadius: "5px",
              border: "none", background: "#666", color: "white"
            }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
