import React, { useEffect, useState, useRef, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";

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

  // UseMemo prevents the graph from re-calculating on every small state change
  const elements = useMemo(() => {
    if (!shipments.length) return [];

    const nodesMap = {};
    const edges = [];

    shipments.forEach((s, i) => {
      // NOTE: Ensure these keys match your Google Sheet EXACTLY
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

      // Ensure sources and targets exist before adding edge to avoid Cytoscape crash
      if (origin && product)
        edges.push({ data: { id: `e1-${i}`, source: origin, target: product, shipment: s, lineColor: color } });
      if (exporter && product)
        edges.push({ data: { id: `e2-${i}`, source: exporter, target: product, shipment: s, lineColor: color } });
      if (product && destination)
        edges.push({ data: { id: `e3-${i}`, source: product, target: destination, shipment: s, lineColor: color } });
    });

    return [...Object.values(nodesMap), ...edges];
  }, [shipments]);

  // Safe Layout Runner
  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      try {
        cyRef.current.layout({ name: "cose", animate: false, padding: 50 }).run();
        cyRef.current.fit();
      } catch (e) {
        console.warn("Layout failed:", e);
      }
    }
  }, [elements]);

  if (loading) return <div style={{ padding: "20px" }}>Loading Graph...</div>;
  if (elements.length === 0) return <div style={{ padding: "20px" }}>No graph data available.</div>;

  return (
    <div style={{ position: "relative", height: "90vh", width: "100%", background: "#f8f9fa" }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        cy={(cy) => {
          cyRef.current = cy;
          
          // Clear previous listeners to prevent memory leaks/multiple triggers
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
              width: 2,
              "line-color": "data(lineColor)",
              "target-arrow-color": "data(lineColor)",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              opacity: 0.7,
            },
          },
        ]}
      />

      {displayedShipment && (
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 1000,
          background: "white", padding: "10px", borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxWidth: "300px"
        }}>
          <strong>Shipment Details</strong>
          <div style={{ fontSize: "12px", marginTop: "5px" }}>
             {/* Render your InfoTable or raw data here */}
             <pre>{JSON.stringify(displayedShipment, null, 2)}</pre>
          </div>
          {lockedShipment && (
             <button onClick={() => setLockedShipment(null)} style={{ marginTop: "10px", width: "100%" }}>
               Close / Unlock
             </button>
          )}
        </div>
      )}
    </div>
  );
}