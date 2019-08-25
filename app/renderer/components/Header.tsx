import * as React from 'react'
import {Navbar, Button, Alignment, Intent} from '@blueprintjs/core'
const styles = require('./Header.scss')

interface Props {
  canSave?: string
}

export default function Header(props: Props) {
  return (
    <Navbar className={`${styles.navbar} bp3-dark`}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading><strong>BreakTimer</strong></Navbar.Heading>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <Button intent={Intent.SUCCESS}>
          Save
        </Button>
      </Navbar.Group>
    </Navbar>
  )
}
