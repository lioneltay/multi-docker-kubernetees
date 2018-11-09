import React from "react"
import axios from "axios"

export default class Fib extends React.Component {
  state = {
    seen_indexes: [],
    values: {},
    index: "",
  }

  componentDidMount() {
    this.fetchValues()
    this.fetchIndexes()
  }

  fetchValues = async () => {
    const values = await axios.get("/api/values/current")
    this.setState({ values: values.data })
  }

  fetchIndexes = async () => {
    const seen_indexes = await axios.get("/api/values/all")
    this.setState({ seen_indexes: seen_indexes.data })
  }

  renderValues = () => {
    const entries = []

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      )
    }

    return entries
  }

  renderSeenIndexes = () => {
    return this.state.seen_indexes.map(({ number }) => number).join(", ")
  }

  handleSubmit = async e => {
    e.preventDefault()

    await axios.post("/api/values", {
      index: this.state.index,
    })
    this.setState({ index: "" })
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={e => this.setState({ index: e.currentTarget.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Values</h3>
        {this.renderValues()}
      </div>
    )
  }
}
