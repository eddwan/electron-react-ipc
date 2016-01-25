'use strict';
import React from 'react';
import ReactDOM from 'react-dom';

const App = React.createClass({
  getInitialState: function() {
    return {value: ''};
  },
  handleInputChange: function(event) {
    this.setState({value: event.target.value});
  },
  onButtonClick: function(event) {
    ipcRenderer.send('sendInvite', this.state.value);
  },
  render: function() {
    return (
      <div>
        Who do you want to share this folder with?
        <input type="text" onChange={this.handleInputChange}/>
        <button type="button" onClick={this.onButtonClick}>Share</button>
      </div>
    );
  }

});

(function() {
  ReactDOM.render(<App/>, document.getElementById('react-root'));
})();