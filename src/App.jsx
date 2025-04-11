import React from "react";
import { MapContainer, TileLayer, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Link, useNavigate, NavLink, redirect } from "react-router-dom";
import Header from "./components/Header";
import RoutingMachine from "./components/RoutingMachine";
import { CircleMarker, Popup } from "react-leaflet";
import { useState } from "react";

function LocationMarker() {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log(`Latitude: ${lat}\nLongitude: ${lng}`);
    },
  });
  return null;
}

function App() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromCoords, setFromCoords] = useState([31.3945, 75.5332]);
  const [toCoords, setToCoords] = useState([31.395, 75.534]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const navigate = useNavigate();
  const damages = [
    { lat: 31.39497559778778, lng: 75.53323101990829, severity: "High" },
    { lat: 31.395465052687886, lng: 75.5332524775804, severity: "Medium" },
    { lat: 31.395244569525595, lng: 75.53481459593058, severity: "Low" },
    { lat: 31.39577976621059, lng: 75.53389191602948, severity: "Low" },
    { lat: 31.395596793328192, lng: 75.53439080690625, severity: "Medium" },
    { lat: 31.395852959955235, lng: 75.53334474539044, severity: "High" },
  ];

  const getColor = (severity) => {
    switch (severity) {
      case "High":
        return "darkred";
      case "Medium":
        return "orange";
      case "Low":
        return "yellowgreen";
      default:
        return "gray";
    }
  };

  const geocodeLocation = async (locationName) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${locationName}`
    );
    const data = await res.json();
    if (data && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } else {
      throw new Error("Location not found");
    }
  };

  const handleRoute = async () => {
    try {
      const from = await geocodeLocation(fromLocation);
      const to = await geocodeLocation(toLocation);
      setFromCoords(from);
      setToCoords(to);
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  const fetchSuggestions = async (query, setter) => {
    if (!query) return setter([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();
      setter(data.slice(0, 5)); // top 5 suggestions
    } catch (err) {
      console.error(err);
      setter([]);
    }
  };

  return (
    <div className="container">
      <div className="inputs">
        <input
          type="text"
          placeholder="From (e.g., Jalandhar)"
          value={fromLocation}
          onChange={(e) => {
            setFromLocation(e.target.value);
            fetchSuggestions(e.target.value, setFromSuggestions);
          }}
        />
        <ul className="suggestions">
          {fromSuggestions.map((sug, idx) => (
            <li
              key={idx}
              onClick={() => {
                setFromLocation(sug.display_name);
                setFromCoords([parseFloat(sug.lat), parseFloat(sug.lon)]);
                setFromSuggestions([]);
              }}
            >
              {sug.display_name}
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder="To (e.g., Amritsar)"
          value={toLocation}
          onChange={(e) => {
            setToLocation(e.target.value);
            fetchSuggestions(e.target.value, setToSuggestions);
          }}
        />
        <ul className="suggestions">
          {toSuggestions.map((sug, idx) => (
            <li
              key={idx}
              onClick={() => {
                setToLocation(sug.display_name);
                setToCoords([parseFloat(sug.lat), parseFloat(sug.lon)]);
                setToSuggestions([]);
              }}
            >
              {sug.display_name}
            </li>
          ))}
        </ul>
      </div>
      <div className="map">
        <MapContainer
          center={fromCoords}
          zoom={30}
          style={{ height: "100vh", width: "100%" }}
          attributionControl={false}
          onClick={LocationMarker}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RoutingMachine from={fromCoords} to={toCoords} />
          {damages.map((damage, index) => (
            <CircleMarker
              key={index}
              center={[damage.lat, damage.lng]}
              radius={6}
              pathOptions={{
                color: getColor(damage.severity),
                fillColor: getColor(damage.severity),
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <strong>Damage Severity:</strong> {damage.severity}
              </Popup>
            </CircleMarker>
          ))}

          <LocationMarker />
        </MapContainer>
        <div
        style={{
          display: "flex",
          flexDirection:"column",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "1rem",
          flexWrap: "wrap",
          position:"absolute",
          top:"100px",
          zIndex:"1000",
          padding:"20px"
        }}
      >
        <div
          style={{
            backgroundColor: "yellowgreen",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "8px",
            minWidth: "10px",
            textAlign: "center",
          }}
        >
          <strong>Low</strong>
          <br />
          Minimal damage
        </div>
        <div
          style={{
            backgroundColor: "orange",
            color: "black",
            padding: "1rem 2rem",
            borderRadius: "8px",
            minWidth: "10px",
            textAlign: "center",
          }}
        >
          <strong>Moderate</strong>
          <br />
          Needs attention
        </div>
        <div
          style={{
            backgroundColor: "darkred",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "8px",
            minWidth: "10px",
            textAlign: "center",
          }}
        >
          <strong>High</strong>
          <br />
          Severe damage
        </div>
      </div>
      </div>
      <div className="popUp">
        <h2>Want to contribute?</h2>
        <button onClick={() => navigate("/upload")}>Click Here</button>
      </div>
    </div>
  );
}

export default App;
