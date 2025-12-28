import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import InfoTable from "./InfoTable.jsx";
import "leaflet/dist/leaflet.css";

// Production-safe icon definition
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

export default function RouteMap() {
  const [shipments, setShipments] = useState([]);
  const [hoveredShipment, setHoveredShipment] = useState(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const url = import.meta.env.VITE_SHEET_API_URL;
    
    if (!url) {
      setErrorMessage("Configuration Error: VITE_SHEET_API_URL is not set in Vercel.");
      setLoading(false);
      return;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          // Captures 401, 404, 500 etc.
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setShipments(data);
        } else {
          console.error("Data is not an array:", data);
          setErrorMessage("Data Format Error: The API did not return a list of shipments.");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setErrorMessage(`Connection Error: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInteraction = (shipment, isClick) => {
    if (isClick) {
      setLocked(!locked);
      setHoveredShipment(shipment);
    } else if (!locked) {
      setHoveredShipment(shipment);
    }
  };

  if (loading) return <div style={statusStyle}><h3>🛰️ Loading Map Data...</h3></div>;
  
  if (errorMessage) return (
    <div style={statusStyle}>
      <h3 style={{ color: "#d93025" }}>⚠️ Map Failed to Load</h3>
      <p>{errorMessage}</p>
      <button onClick={() => window.location.reload()} style={btnStyle}>Retry</button>
    </div>
  );

  return (
    <div className="map-wrapper" style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={[20, 10]} zoom={3} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution='&copy; Stadia Maps'
        />

        {shipments.map((s, i) => {
          const lat1 = parseFloat(s["Origin latitude"]);
          const lng1 = parseFloat(s["Origin longitude"]);
          const lat2 = parseFloat(s["Destination latitude"]);
          const lng2 = parseFloat(s["Destination longitude"]);

          if ([lat1, lng1, lat2, lng2].some(isNaN)) return null;

          const isSelected = hoveredShipment === s;

          return (
            <React.Fragment key={`shipment-${i}`}>
              <Polyline
                positions={[[lat1, lng1], [lat2, lng2]]}
                color={s["COLOR"] || "#0074D9"}
                weight={isSelected ? 5 : 2}
                opacity={isSelected ? 1 : 0.6}
                eventHandlers={{
                  mouseover: () => handleInteraction(s, false),
                  mouseout: () => !locked && setHoveredShipment(null),
                  click: () => handleInteraction(s, true),
                }}
              />
              <Marker position={[lat1, lng1]} icon={customIcon} />
              <Marker position={[lat2, lng2]} icon={customIcon} />
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Info Panel using your index.css classes */}
      {hoveredShipment && (
        <div className="info-table-wrapper">
          <div className="info-table-actions">
            <button onClick={() => {setLocked(false); setHoveredShipment(null);}}>Close</button>
            <button 
              onClick={() => setLocked(!locked)} 
              style={{ backgroundColor: locked ? "#ff4136" : "#0074d9", color: "white", border: "none", borderRadius: "4px" }}
            >
              {locked ? "Unlock" : "Lock Details"}
            </button>
          </div>
          <div className="info-table-content">
             <InfoTable shipment={hoveredShipment} locked={locked} />
          </div>
        </div>
      )}
    </div>
  );
}

const statusStyle = {
  display: "flex", flexDirection: "column", height: "100vh", 
  alignItems: "center", justifyContent: "center", fontFamily: "sans-serif"
};

const btnStyle = {
  marginTop: "10px", padding: "8px 16px", cursor: "pointer", 
  background: "#0074D9", color: "white", border: "none", borderRadius: "4px"
};
