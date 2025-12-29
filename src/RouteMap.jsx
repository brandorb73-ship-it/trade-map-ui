import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import InfoTable from "./InfoTable.jsx";
import "leaflet/dist/leaflet.css";

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

  if (loading) return <div style={{padding: '20px'}}>Loading Map...</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
        {/* Switched to OpenStreetMap to avoid 401 errors */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {shipments.map((s, i) => {
          const lat1 = parseFloat(s["Origin latitude"]);
          const lng1 = parseFloat(s["Origin longitude"]);
          const lat2 = parseFloat(s["Destination latitude"]);
          const lng2 = parseFloat(s["Destination longitude"]);
          if ([lat1, lng1, lat2, lng2].some(isNaN)) return null;

          return (
            <React.Fragment key={i}>
              <Polyline
                positions={[[lat1, lng1], [lat2, lng2]]}
                color={s["COLOR"] || "blue"}
                weight={3}
                eventHandlers={{
                  mouseover: () => !locked && setHoveredShipment(s),
                  mouseout: () => !locked && setHoveredShipment(null),
                  click: () => { setLocked(!locked); setHoveredShipment(s); }
                }}
              />
              <Marker position={[lat1, lng1]} icon={customIcon} />
              <Marker position={[lat2, lng2]} icon={customIcon} />
            </React.Fragment>
          );
        })}
      </MapContainer>

      {hoveredShipment && (
        <div style={{
          position: "absolute", top: "20px", left: "20px", zIndex: 1000,
          background: "white", padding: "20px", borderRadius: "8px",
          width: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          <button onClick={() => {setLocked(false); setHoveredShipment(null);}} style={{float: 'right'}}>Close</button>
          <InfoTable shipment={hoveredShipment} />
        </div>
      )}
    </div>
  );
}
