import type { Rule } from '../types'

const rule10: Rule = {
  number: 10,
  title: `Sticks`,
  subsections: [
    {
      id: '10.1',
      title: `Player’s Stick`,
      content: `It is recommended that sticks be made of wood or a combination of wood and other materials (including composite), and must not have any projections. Adhesive tape of any color may be wrapped around the stick at any place for the purpose of reinforcement or to improve control of the puck. A stick shall not exceed 65 inches in length from the heel to the end of the shaft nor more than 12-½ inches from the heel to the end of the blade. The blade of the stick shall not be more than 3 inches nor less than 2 inches in width at any point. All edges of the blade shall be beveled.`,
      penalty: `PENALTY: Minor.`,
    },
    {
      id: '10.2',
      title: `Goalkeeper’s Stick`,
      content: `The blade of the goalkeeper’s stick shall not exceed 3-½ inches in width at any point except at the heel where it cannot exceed 4-½ inches in width; nor shall it exceed 15-½ inches in length from the heel to the end of the blade. The widened portion of the goalkeeper’s stick extending up the shaft from the blade shall not extend more than 28 inches from the heel and shall not exceed 3-½ inches in width.`,
      penalty: `PENALTY: Minor.`,
    },
    {
      id: '10.3',
      title: `Broken Stick - Player`,
      content: `A player without a stick may participate in the game. A player whose stick is broken may participate in the game provided the player immediately drops the broken stick. A broken stick is one that, in the opinion of the`,
    }
  ]
}

export default rule10
