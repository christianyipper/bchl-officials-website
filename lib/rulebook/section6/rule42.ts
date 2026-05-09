import type { Rule } from '../types'

const rule42: Rule = {
  number: 42,
  title: `Boarding`,
  subsections: [
    {
      id: '42.1',
      title: `Boarding`,
      content: `A player shall not body check, cross-check, elbow, charge or trip an opponent from the front or side in such a manner that causes the opponent to be thrown violently into the boards (see Rule 50).`,
      penalty: `PENALTY: Minor, major and game misconduct or match may be assessed at the discretion of the referee based on degree of violence of the impact with the boards.`,
    }
  ]
}

export default rule42
