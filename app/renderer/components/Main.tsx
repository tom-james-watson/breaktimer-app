import * as React from 'react'
import Settings from './Settings'

export default function Main() {
  const params = new URLSearchParams(location.search)
  const page = params.get('page')

  if (page === 'settings') {
    return <Settings />
  }

  return null
}
