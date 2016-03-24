import React from 'react'
import { config } from 'config'
import { rhythm } from 'utils/typography'
import { link } from 'gatsby-helpers'

class Bio extends React.Component {
  render () {
    return (
      <p
        style={{
          marginBottom: rhythm(2.5),
        }}
      >
        <img
          src={link('/suenot-round-small.jpg')}
          style={{
            float: 'left',
            marginRight: rhythm(1/4),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
          }}
        />
        <strong>{config.authorName}</strong> live in Moscow. Interests: ergonomic keyboards, ux, javascript, python, R, Hadoop, Mongo, Tarantool.
      </p>
    )
  }
}

export default Bio
