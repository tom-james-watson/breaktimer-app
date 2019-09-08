import * as React from 'react'
import Settings from './Settings'
import Sounds from './Sounds'

export default function Main() {
  const params = new URLSearchParams(location.search)
  const page = params.get('page')

  if (page === 'settings') {
    return <Settings />
  }

  if (page === 'sounds') {
    return <Sounds />
  }

  return null
}
