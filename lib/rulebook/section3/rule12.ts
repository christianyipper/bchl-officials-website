import type { Rule } from '../types'

const rule12: Rule = {
  number: 12,
  title: `Illegal Equipment`,
  subsections: [
    {
      id: '12.1',
      title: `Illegal Equipment`,
      content: `A glove from which all or part of the palm has been removed or cut to permit the use of the bare hand shall be considered illegal equipment. Pants with zippers on the leg opening must be zippered during play.`,
      penalty: `PENALTY: Players shall not be permitted to participate in the warm-up and game until equipment has been corrected or removed. Minor penalty for second offence by the same player in the same game. Game misconduct for third offence by the same player in the same game.`,
    },
    {
      id: '12.2',
      title: `Dangerous Equipment`,
      content: `The use of pads or protectors made of metal, or of any other material likely to cause injury to a player, is prohibited. Jewelry shall not be worn, except for religious or medical medals, which shall be taped to the body under the uniform.`,
      penalty: `PENALTY: Players shall not be permitted to participate in the warm-up and game until equipment has been corrected or removed. Minor penalty for second offence by the same player in the same game. Game misconduct for third offence by the same player in the same game.`,
    },
    {
      id: '12.3',
      title: `Measurement and Challenging of Equipment`,
      content: `A request to measure or check any equipment shall be limited to Rule 10.5–Stick Measurement, and to one request by each team per stoppage of play and may involve only one player during each stoppage of play.`,
      penalty: `PENALTY: Minor if stick is found to be illegal. Bench minor to challenging team if player’s equipment is found to be legal.`,
    },
    {
      id: '12.4',
      title: `Approved Equipment Branding`,
      content: `While participating in a BCHL regular season or playoff game ONLY players (including affiliates) are required to use a BAUER branded player sticks, helmet, gloves, pants, and visors, as per the supplier agreement. Goaltenders while participating in a BCHL regular season or playoff game ONLY required to have a Bauer Stick.`,
    }
  ]
}

export default rule12
