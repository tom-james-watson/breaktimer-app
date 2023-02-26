import {Checkbox, Button} from "@blueprintjs/core"
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
            <FormGroup>
                {
                    timeList.map((item, index) =>
                        <Checkbox
                            key={index}
                            label={item.toString()}
                            inline={true}
                            checked={this.state.selectedIndexes.includes(index)}
                            onChange={() => {
                                if (this.state.selectedIndexes.includes(index)) {
                                    this.setIndices(this.state.selectedIndexes.filter((item) => item !== index))
                                } else {
                                    this.setIndices([...this.state.selectedIndexes, index])
                                }

                                // console.log(this.state.selectedIndexes)
                                // console.log("Clicked")
                            }}
                        />)
                }<Button text="Reverse"
                    onClick={() => {
                        this.setIndices(timeList.filter((item) => !this.state.selectedIndexes.includes(item)))

                    }} style={{marginRight: 10}}
                />
                <Button text="Clear"
                    onClick={() => this.setIndices([])} />
            </FormGroup>)

    }

}