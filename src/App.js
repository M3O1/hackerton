import React, {Component} from "react";
import { Input, Menu, Segment } from 'semantic-ui-react'
import fetch from "isomorphic-fetch";
import { compose, withProps, withHandlers } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  Circle,
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
    {props.next_pos && <Circle
      center ={{lat:props.next_pos.lat,lng:props.next_pos.lng}}
      radius = {1000}
      options = {{ fillColor: '#E40019'}}
    />}
    {props.directions && <DirectionsRenderer directions={props.directions} />}
  </GoogleMap>
);


export default class App extends React.PureComponent {
  componentWillMount() {
    this.setState({
      activeVersion: 'one-Point',
      markers: [],
      curr_pos: null,
      next_pos: null})
  }
  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  onWindowRightClick = (x) => {
    const {curr_pos, next_pos} = this.state;
    this.setState({
      curr_pos: {
        lat : x.latLng.lat(),
        lng : x.latLng.lng()
      }
    });
    if(next_pos) this.drawDirection()
  }

  onWindowLeftClick = (x) => {
    const {curr_pos, next_pos} = this.state;
    this.setState({
      next_pos: {
        lat : x.latLng.lat(),
        lng : x.latLng.lng()
      }
    });
    if(curr_pos) this.drawDirection()
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
    const {activeItem, markers, curr_pos, next_pos, directions } = this.state;
    return (
      <div>
        <Menu pointing>
          <Menu.Item name='one-Point' active={activeItem === 'one-Point'} onClick={this.handleItemClick} />
          <Menu.Item name='Multi-Point' active={activeItem === 'Multi-Point'} onClick={this.handleItemClick} />
        </Menu>
        <Segment>
          <MapWithAMarkerClusterer
            markers={markers}
            onWindowRightClick={this.onWindowRightClick}
            onWindowLeftClick={this.onWindowLeftClick}
            curr_pos={curr_pos}
            next_pos={next_pos}
            directions={directions}
          />
        </Segment>
      </div>
    )
  }
}

