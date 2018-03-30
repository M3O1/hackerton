import React from "react";
import fetch from "isomorphic-fetch";
import { compose, withProps, withHandlers } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  DirectionsRenderer
} from "react-google-maps";
import { MarkerClusterer } from "react-google-maps/lib/components/addons/MarkerClusterer";

const MapWithAMarkerClusterer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBsraKM3f33D2-Gevxy3UPW8UPzhR6fttM&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `800px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withHandlers({
  }),
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    defaultZoom={10}
    defaultCenter={{ lat: 40.75, lng: -73.98 }}
    onClick={props.onWindowLeftClick}
    onRightClick={props.onWindowRightClick}
  >
    {props.curr_pos && <Marker
      position={{lat:props.curr_pos.lat,lng:props.curr_pos.lng}}
    />}
    {props.next_pos && <Marker
      position={{lat:props.next_pos.lat,lng:props.next_pos.lng}}
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

  onWindowRightClick = (x) => {
    this.setState({
      curr_pos: {
        lat : x.latLng.lat(),
        lng : x.latLng.lng()
      }
    });
    if (curr_pos & next_pos) this.drawDirection()
  }

  onWindowLeftClick = (x) => {
    this.setState({
      next_pos: {
        lat : x.latLng.lat(),
        lng : x.latLng.lng()
      }
    });
    if (curr_pos & next_pos) this.drawDirection()
  }

  drawDirection = () => {
    const DirectionsService = new google.maps.DirectionsService();
    const {curr_pos, next_pos} = this.state;
    DirectionsService.route({
      origin: new google.maps.LatLng(curr_pos.lat, curr_pos.lng),
      destination: new google.maps.LatLng(next_pos.lat, next_pos.lng),
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.setState({
          directions: result,
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
