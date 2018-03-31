import React, {Component} from "react";
import { Button, Input, Menu, Segment,Icon} from 'semantic-ui-react'
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
    loadingElement: <div style={{ height: `80%` }} />,
    containerElement: <div style={{ height: `700px` }} />,
    mapElement: <div style={{ height: `97%` }} />,
  }),
  withHandlers({
  }),
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    defaultZoom={12}
    defaultCenter={{ lat: 40.75, lng: -73.98 }}
    onClick={props.onWindowLeftClick}
    onRightClick={props.onWindowRightClick}
  >
    {props.curr_pos && <Marker
      position={{lat:props.curr_pos.lat,lng:props.curr_pos.lng}}
    />}

    { props.next_pos ? <Circle
      center ={{lat:props.next_pos.lat,lng:props.next_pos.lng}}
      radius = {1000}
      options = {{ fillColor: '#E40019'}}
    /> : null }

    { props.directions && <DirectionsRenderer directions={props.directions} />}

    {props.next_pos_list && props.next_pos_list.map( ({lat,lng},idx) => {
      return(<Circle
          center = {{lat:lat, lng:lng}}
          radius = {1000}
          options = {{fillColor: '#E40019'}}
          key = {idx}
        />) })
    }
  </GoogleMap>
);

const ButtonExampleFluid = (props) => (
  <Button fluid onClick={props.onClick}>Find your Road</Button>
)


export default class App extends React.PureComponent {
  componentWillMount() {
    this.setState({
      activeItem: 'one-Point',
      markers: [],
      curr_pos: null,
      next_pos: null,
      next_pos_list: null,
      directions:null
    })
  }

  handleItemClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      curr_pos: null,
      next_pos: null,
      next_pos_list: null,
      directions:null
    })
  }

  onWindowRightClick = (x) => {
    const {curr_pos, next_pos, activeItem} = this.state;
    this.setState({
      curr_pos: {
        lat : x.latLng.lat(),
        lng : x.latLng.lng()
      }
    });

    (activeItem==='one-Point') ? (
      fetch(`/single_point?lat=${x.latLng.lat()}&lng=${x.latLng.lng()}`)
      .then(res => res.json())
      .then(res => {
        this.setState({
          next_pos : {
            lat : res.lat,
            lng : res.lng
          }
        });
      })
    ) : (
      fetch(`/multi_point?lat=${x.latLng.lat()}&lng=${x.latLng.lng()}`)
      .then(res => res.json())
      .then(res => {
        this.setState({
          next_pos_list : res
        });
      })
    )
  }

  onWindowLeftClick = (x) => {
    const {curr_pos, next_pos, activeItem} = this.state;
    if (activeItem!=="one-Point") return;
    this.setState({
      next_pos: {
        lat : x.latLng.lat(),
        lng : x.latLng.lng()
      }
    });
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
    const {activeItem, markers, curr_pos, next_pos, directions, next_pos_list } = this.state;
    return (
      <div className="App">
        <Menu pointing color={"yellow"} >
          <Menu.Item
            name='one-Point'
            active={activeItem === 'one-Point'}
            onClick={this.handleItemClick}
            />
          <Menu.Item
            name='Multi-Point'
            active={activeItem === 'Multi-Point'}
            onClick={this.handleItemClick} />
          <Menu.Item position='right'>
            <Icon fitted name="road" />
          </Menu.Item>
        </Menu>
        <Segment color="yellow">
          <MapWithAMarkerClusterer
            markers={markers}
            onWindowRightClick={this.onWindowRightClick}
            onWindowLeftClick={this.onWindowLeftClick}
            curr_pos={curr_pos}
            next_pos={next_pos}
            next_pos_list={next_pos_list}
            directions={directions}
            active={activeItem === 'one-Point'}
          />
          <ButtonExampleFluid onClick={this.drawDirection}/>
        </Segment>
      </div>
    )
  }
}
