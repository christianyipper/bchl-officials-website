import type { Rule } from '../types'

const rule72: Rule = {
  number: 72,
  title: `Illegal Substitution`,
  subsections: [
    {
      id: '72.1',
      title: `Illegal Substitution`,
      content: `An illegal substitution shall be deemed to have occurred when a player enters the game illegally from either the players’ bench (teammate not within the five (5) foot limit, refer to Too Many Men on the Ice), from the penalty bench (penalty has not yet expired), when a major penalty is being served and the replacement player does not return to the ice from the penalty bench, or when a player illegally enters the game for the sole purpose of preventing an opposing player from scoring on a breakaway. When an injured player is penalized and leaves the game, if he returns before the expiration of his penalty, he is not eligible to play. This includes coincidental penalties when his substitute is still in the penalty box awaiting a stoppage in play. The injured player must wait until his substitute has been released from the penalty box before he is eligible to play.`,
      penalty: `PENALTY: Minor.`,
    },
    {
      id: '72.2',
      title: `Illegal Substitution on Breakaway`,
      content: `A player shall not illegally enter the game and interfere with a player in possession of the puck having no opposition between the player and the opposing goalkeeper.`,
      penalty: `PENALTY 1: Penalty shot. If this illegal act prevents an obvious and imminent goal, a goal shall be awarded.

If an extra player from the bench or the penalty bench tries to prevent a breakaway, there shall be a delayed whistle.

PENALTY 2: Penalty shot. If this illegal act prevents an obvious and imminent goal, a goal shall be awarded.`,
    },
    {
      id: '72.3',
      title: `Deliberate Illegal Substitution`,
      content: `There shall not be a deliberate illegal substitution in the last two minutes of regulation time or any time during overtime.`,
      penalty: `PENALTY: Penalty shot. If the illegal substitution comes from the penalty bench, an additional minor shall be assessed on that player. If this illegal act prevents an obvious and imminent goal, a goal shall be awarded.`,
    }
  ]
}

export default rule72
