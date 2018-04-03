import React from 'react';

class LinkList extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {

    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default LinkList;
