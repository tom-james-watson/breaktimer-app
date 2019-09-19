import * as React from 'react'
import {Navbar, Button, Alignment, Intent} from '@blueprintjs/core'
const styles = require('./SettingsHeader.scss')

interface Props {
  textColor: string
  backgroundColor: string
  handleSave: () => void
}

export default function SettingsHeader(props: Props) {
  const {textColor, backgroundColor, handleSave} = props

  const style = {
    color: textColor,
    backgroundColor
  }

  return (
    <Navbar className={`${styles.navbar} bp3-dark`} style={style}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <strong>Settings</strong>
        </Navbar.Heading>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <Button intent={Intent.PRIMARY} onClick={handleSave}>
          Save
        </Button>
      </Navbar.Group>
    </Navbar>
  )
}
