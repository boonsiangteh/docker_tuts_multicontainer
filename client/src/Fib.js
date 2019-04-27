import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {

  state = {
    seenIndexes: [],
    values: {} ,
    index: ''
  }

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  fetchValues = async () => {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  fetchIndexes = async () => {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({ seenIndexes: seenIndexes.data });
  }

  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(', ');
  }

  renderSeenValues() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated { this.state.values[key] }
        </div>
      );
    }

    return entries;
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post('/api/values', {
      index: this.state.index
    });

    this.setState({index: ''});
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter index:</label>
          <input
            value={this.state.index}
            onChange={(event) => this.setState({index: event.target.value})}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Values</h3>
        {this.renderSeenValues()}
      </div>
    );
  }

}

export default Fib;
