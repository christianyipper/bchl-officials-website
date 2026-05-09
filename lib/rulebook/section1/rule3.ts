import type { Rule } from '../types'

const rule3: Rule = {
  number: 3,
  title: `Benches`,
  subsections: [
    {
      id: '3.1',
      title: `Players’ Benches`,
      content: `The rink shall provide seats or benches for the use of players of both teams that accommodate at least 21 persons of each team. The benches should be placed immediately alongside the ice in the neutral zone, as near to the center of the rink as possible, with the doors opening in the neutral zone, convenient to the dressing rooms. It is recommended that each players’ bench should have two doors opening in the neutral zone (see Rule 1.3). Each players’ bench should have an elevated coaches’ walkway behind the area where the players are seated. Only players in uniform and five additional team personnel shall be permitted to occupy the bench area. For a violation, after a warning by the referee, a bench minor penalty shall be assessed.`,
      penalty: `PENALTY: For a violation, after a warning by the referee, a bench minor penalty shall be assessed.`,
    },
    {
      id: '3.2',
      title: `Penalty Bench`,
      content: `The rink must be provided with benches or seats to be known as the penalty bench. It is preferable to have penalty benches for each team separated from each other and substantially separated from either players’ bench. The penalty benches should be situated in the neutral zone. The penalty benches should accommodate at least 10 persons, including the timekeeper, the penalty timekeeper, the scorer and penalized players.`,
    },
    {
      id: '3.3',
      title: `Separation from Spectators`,
      content: `All benches shall be separated from any spectator areas, preferably by boards and glass of a sufficient height.`,
    }
  ]
}

export default rule3
