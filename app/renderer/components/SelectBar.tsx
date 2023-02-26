import {Button, ButtonGroup} from "@blueprintjs/core"
import {WorkingHoursAdvanced} from "app/types/settings"
import React from "react"

import {FormGroup} from "reactstrap"
interface Istate {
  mousePressed: boolean
  selectedIndexes: number[]
}
const timeList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
type Iprops = {
  field: keyof WorkingHoursAdvanced
  setFunction: (field: keyof WorkingHoursAdvanced, value: number[]) => void
  initialValue: number[]
}
export class SelectBar extends React.Component<Iprops, Istate> {
  constructor(props: Iprops) {
    super(props)
    this.state = {
      mousePressed: false,
      selectedIndexes: this.props.initialValue
    }
  }

  setIndices = (e: number[]) => {
    this.setState({selectedIndexes: e})
    this.props.setFunction(this.props.field, e)
  }

  render(): React.ReactNode {
    return (
      <FormGroup style={{marginRight: 20, marginBottom: 10}}>
        <ButtonGroup fill={true} >
          {
            timeList.slice(0, 14).map((item, i) =>
              <Button
                key={i}
                text={item.toString()}
                // inline={true}
                intent={this.state.selectedIndexes.includes(item) ? "primary" : "none"}
                onClick={() => {
                  if (this.state.selectedIndexes.includes(item)) {
                    this.setIndices(this.state.selectedIndexes.filter((j) => j !== item))
                  } else {
                    this.setIndices([...this.state.selectedIndexes, item])
                  }
                }}
              />)
          }
        </ButtonGroup>
        <ButtonGroup fill={true}>
          {
            timeList.slice(14, 24).map((item, i) =>
              <Button
                key={i}
                text={item.toString()}
                // inline={true}
                intent={this.state.selectedIndexes.includes(item) ? "primary" : "none"}
                onClick={() => {
                  if (this.state.selectedIndexes.includes(item)) {
                    this.setIndices(this.state.selectedIndexes.filter((j) => j !== item))
                  } else {
                    this.setIndices([...this.state.selectedIndexes, item])
                  }
                }}
              />)
          }<Button icon="refresh"
            title="Reverse Selection"
            onClick={() => {
              this.setIndices(timeList.filter((item) => !this.state.selectedIndexes.includes(item)))
            }}
          />
          <Button icon="delete"
            title="Clear Selection"
            onClick={() => this.setIndices([])} />
        </ButtonGroup>
      </FormGroup>)
  }
}