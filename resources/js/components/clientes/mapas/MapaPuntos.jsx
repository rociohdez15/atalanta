// mapas/MapaPuntos.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Definir un icono personalizado para usar en cada marker
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],       // Tamaño del icono
  iconAnchor: [12, 41],     // Punto del icono que corresponde a la ubicación del marcador
  popupAnchor: [1, -34],    // Punto desde el que se abre el popup respecto al icono
  shadowSize: [41, 41],     // Tamaño de la sombra
});


// Componente para forzar actualización
const RedrawMap = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize(); // Fuerza que Leaflet redibuje el mapa
    }, 100); // espera breve tras montaje
  }, [map]);

  return null;
};

const MapaPuntos = ({ puntos }) => {
  if (!puntos || puntos.length === 0) return null;

  // Centrar el mapa en el primer punto
  const centro = [puntos[0].latitud, puntos[0].longitud];

  return (
    <div style={{ height: "400px", width: "100%", marginTop: "2rem" }}>
      <MapContainer
  center={centro}
  zoom={13}
  className="custom-map-container"
  style={{ height: "100%", width: "100%" }}
>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {puntos.map((punto, idx) => (
          <Marker key={idx} position={[punto.latitud, punto.longitud]} icon={iconDefault}>
            <Popup>
              {punto.nombre || `Punto ${idx + 1}`}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaPuntos;
