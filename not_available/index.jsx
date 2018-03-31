import React, { Component } from 'react';
import { render } from 'react-dom';


class App extends Component {
  constructor(props) {
    super(props);
    // this.state = { urlLoaded: false };
  }

  componentDidMount() {

  }


  render = () => {
    return (
      <div>
        hihi
      </div>
    );
  }
}


render(<App />, document.getElementById('root'));
