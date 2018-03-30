import React from "react";
const fetch = require("isomorphic-fetch");
const { compose, withProps, withHandlers } = require("recompose");
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  DirectionsRenderer
} = require("react-google-maps");
const { MarkerClusterer } = require("react-google-maps/lib/components/addons/MarkerClusterer");

const MapWithAMarkerClusterer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBsraKM3f33D2-Gevxy3UPW8UPzhR6fttM&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `800px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withHandlers({
    onMarkerClustererClick: () => (markerClusterer) => {
      const clickedMarkers = markerClusterer.getMarkers()
    },
  }),
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    defaultZoom={10}
    defaultCenter={{ lat: 40.75, lng: -73.98 }}
    onRightClick={props.onWindowRightClick}
    onClick={props.onWindowLeftClick}
  >
    <MarkerClusterer
      onClick={props.onMarkerClustererClick}
      averageCenter
      enableRetinaIcons
      gridSize={60}
    >
      {props.markers.map(marker => (
        <Marker
          key={marker.photo_id}
          position={{ lat: marker.latitude, lng: marker.longitude }}
        />
      ))}
    </MarkerClusterer>
    {props.curr_pos && <Marker
      position={{lat:props.curr_pos[0],lng:props.curr_pos[1]}}
    />}
    {props.next_pos && <Marker
      position={{lat:props.next_pos[0],lng:props.next_pos[1]}}
    />}
    {props.directions && <DirectionsRenderer directions={props.directions} />}
  </GoogleMap>
);

export default class App extends React.PureComponent {
  componentWillMount() {
    this.setState({
      markers: [],
      curr_pos: null,
      next_pos: null})
  }

  componentDidMount() {
  }

  onWindowRightClick = (x) => {
      console.log("Position : ",x.latLng.lat(),x.latLng.lng());
      this.setState({curr_pos: [x.latLng.lat(),x.latLng.lng()]})
  }

  onWindowLeftClick = (x) => {
      const DirectionsService = new google.maps.DirectionsService();
      const {curr_pos} = this.state;

      DirectionsService.route({
        origin: new google.maps.LatLng(curr_pos[0], curr_pos[1]),
        destination: new google.maps.LatLng(x.latLng.lat(), x.latLng.lng()),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
            next_pos: [x.latLng.lat(),x.latLng.lng()]
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });

  }

  render() {
    return (
      <MapWithAMarkerClusterer
        markers={this.state.markers}
        onWindowRightClick={this.onWindowRightClick}
        onWindowLeftClick={this.onWindowLeftClick}
        curr_pos={this.state.curr_pos}
        next_pos={this.state.next_pos}
        directions={this.state.directions}
      />
    )
  }
}
