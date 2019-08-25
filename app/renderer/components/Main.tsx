import * as React from 'react'
import Header from './Header'
const styles = require('./Main.scss')

export default function Main() {
  return (
    <React.Fragment>
      <Header />
      <main className={styles.main}>
        <p>Stuff</p>
      </main>
    </React.Fragment>
  )
}
