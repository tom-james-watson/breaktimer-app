import * as React from 'react'
import {Navbar, Button, Alignment, Intent} from '@blueprintjs/core'
const styles = require('./SettingsHeader.scss')

interface Props {
  handleSave: () => void
}

export default function SettingsHeader(props: Props) {
  const {handleSave} = props

  return (
    <Navbar className={`${styles.navbar} bp3-dark`}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>
          <strong>Settings</strong>
        </Navbar.Heading>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <Button intent={Intent.SUCCESS} onClick={handleSave}>
          Save
        </Button>
      </Navbar.Group>
    </Navbar>
  )
}
