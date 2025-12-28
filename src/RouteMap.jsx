import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import InfoTable from "./InfoTable.jsx";

// Define the icon ONCE outside the component to prevent re-renders
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 25],
  iconAnchor: [12, 12]
});

export default function RouteMap() {
  const [shipments, setShipments] = useState([]);
  const [hoveredShipment, setHoveredShipment] = useState(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = import.meta.env.VITE_SHEET_API_URL;
    if (!url) {
      console.error("VITE_SHEET_API_URL is not defined!");
      setLoading(false);
      return;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // SAFETY CHECK: Ensure data is an array
        if (Array.isArray(data)) {
          setShipments(data);
        } else {
          console.error("Expected array from Google Sheets, got:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleMouseEnter = (shipment) => { if (!locked) setHoveredShipment(shipment); };
  const handleMouseLeave = () => { if (!locked) setHoveredShipment(null); };
  const handleClick = (shipment) => {
    setLocked(!locked);
    setHoveredShipment(!locked ? shipment : null);
  };

  // If loading or no data, show a message instead of a blank screen
  if (loading) return <div style={{padding: '20px'}}>Loading Trade Map...</div>;
  if (!Array.isArray(shipments) || shipments.length === 0) {
     return <div style={{padding: '20px'}}>No shipment data found. Check Google Sheet permissions.</div>;
  }

  return (
    <>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100vh", width: "100vw" }}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution='&copy; Stadia Maps'
        />

        {shipments.map((s, i) => {
          const originLat = parseFloat(s["Origin latitude"]);
          const originLng = parseFloat(s["Origin longitude"]);
          const destLat = parseFloat(s["Destination latitude"]);
          const destLng = parseFloat(s["Destination longitude"]);
          const color = s["COLOR"] || "blue";

          if ([originLat, originLng, destLat, destLng].some((v) => isNaN(v))) return null;

          return (
            <React.Fragment key={`group-${i}`}>
              <Polyline
                positions={[[originLat, originLng], [destLat, destLng]]}
                color={color}
                weight={3}
                eventHandlers={{
                  mouseover: () => handleMouseEnter(s),
                  mouseout: () => handleMouseLeave(),
                  click: () => handleClick(s),
                }}
              />
              <Marker position={[originLat, originLng]} icon={customIcon} />
              <Marker position={[destLat, destLng]} icon={customIcon} />
            </React.Fragment>
          );
        })}
      </MapContainer>

      {hoveredShipment && (
        <div style={{
            position: "fixed", right: "20px", top: "25%", width: "380px",
            maxHeight: "55%", backgroundColor: "#fff", border: "1px solid #ccc",
            borderRadius: "5px", padding: "10px", zIndex: 1000,
            display: "flex", flexDirection: "column", boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
          }}>
          <button onClick={() => setLocked(!locked)} style={{ marginBottom: "10px", cursor: "pointer" }}>
            {locked ? "Unlock Table" : "Lock Table"}
          </button>
          <div style={{ overflowY: "auto" }}>
            <InfoTable shipment={hoveredShipment} />
          </div>
        </div>
      )}
    </>
  );
}