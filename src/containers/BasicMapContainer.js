import React from "react";
import BasicMapComponent from "../components/BasicMapComponent";

export default class BasicMapContainer extends React.PureComponent {
  constructor(){
    super();
    this.state = {
      isMarkerShown: false,
    };
  }

  componentDidMount() {
    this.delayedShowMarker();
  }

  delayedShowMarker = () => {
    console.log("handlermarkerclick")
    setTimeout(() => {
      this.setState({ isMarkerShown: true })
    }, 1000)
  }

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker()
  }

  render() {
    return (
      <BasicMapComponent
        isMarkerShown={this.state.isMarkerShown}
        onMarkerClick={this.handleMarkerClick}
      />
    )
  }
}
