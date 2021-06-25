import React, { useEffect } from "react";
import "./App.css";
import { Map, TileLayer, Marker, Popup, useLeaflet } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// make new leaflet element
const Search = (props) => {
  const { map } = useLeaflet() // access to leaflet map
  const { provider } = props;

  useEffect(() => {
    const searchControl = new GeoSearchControl({
      provider,
    });

    map.addControl(searchControl) // this is how you add a control in vanilla leaflet
    return () => map.removeControl(searchControl)
  }, [props, map, provider]);

  return null; // don't want anything to show up from this comp
};

class LeafletMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: 0,
      longitude: 0,
      address: "Address not found"
    }
  }

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        fetch("https://nominatim.openstreetmap.org/reverse?format=geojson&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude)
          .then(response => response.json())
          .then(result => {
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: result.features[0].properties.display_name
            });
          }
          );
      });
    } else {
      console.error("Geolocation is not supported by this browser!");
    }
  };

  render() {
    const position = [this.state.latitude, this.state.longitude];
    return (
      <div>
        <Map style={{ height: "100vh", width: "100vw" }} zoom={10} center={position}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{this.state.address}</Popup>
          </Marker>
          <Search provider={new OpenStreetMapProvider()} />
        </Map>
      </div>
    );
  }
};

export default LeafletMap;
