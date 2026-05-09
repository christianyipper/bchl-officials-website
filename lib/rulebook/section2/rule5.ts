import type { Rule } from '../types'

const rule5: Rule = {
  number: 5,
  title: `Team`,
  subsections: [
    {
      id: '5.1',
      title: `Team`,
      content: `A team shall have not more than six players on the ice at any one time while play is in progress. These six players shall be designated as follows: goalkeeper, right defense, left defense, center, right wing and left wing.`,
    },
    {
      id: '5.2',
      title: `Players in Uniform`,
      content: `At the beginning of each game, the coach of each team shall list the players and goalkeepers who shall be eligible to play in the game. A maximum of 19 players, plus two goalkeepers, shall be permitted; and a captain shall be designated in addition 3 alternate captains. A team may also elect to designate 3 alternate captains instead of dressing one captain.`,
      penalty: `PENALTY: Bench minor.

Only players from each team shall participate in the pregame warmup. Not more than 20 players and two goalkeepers may participate in the pregame warm-up. These players do not necessarily have to be the same players listed on the official game report form. It is mandatory, however, that 19 players and not more than two goalkeepers listed on the official game report form are the players who shall dress for the game (see Rule 90.5). Room for the 22nd player will be added to the BCHL game sheet and removed after warm-up.`,
    },
    {
      id: '5.3',
      title: `Goalkeeper`,
      content: `Each team shall be allowed one goalkeeper on the ice at one time. The goalkeeper may be removed and another player substituted. A substitute goalkeeper should be on the bench at the start of the game and shall at all times be fully dressed and equipped and ready to play. Upon entering the game, the substitute goalkeeper shall take his position without delay. Teams are encouraged to not start a game with fewer than two goalkeepers. A team is allowed to start a game with one goalkeeper. If the starting goalkeeper is unable to continue (e.g., injury, penalty, etc.), a delay of game penalty may be assessed if time is needed to have another skater change into the equipment of the goalkeeper. Additionally, teams have the option of playing with six skaters to avoid a penalty. Except when all goalkeepers are incapacitated, another player shall not be permitted to wear the equipment of the goalkeeper.`,
    },
    {
      id: '5.4',
      title: `Emergency Backup Goalkeeper (EBUG)`,
      content: `In regular League and playoff games, if both listed goalkeepers are incapacitated, that team shall be entitled to dress and play any goalkeeper who is eligible. In the event that the one of the regular goalkeepers is injured or incapacitated, a third emergency goalkeeper (EBUG) shall be permitted to dress and be ready on the players bench. The EBUG shall only be permitted to enter the game in the event the second regular goalkeeper is injured or incapacitated. A one-minute warmup is permitted for the EBUG only (except when he enters the game to defend against a penalty shot). In the event that the two regular goalkeepers are injured or incapacitated in quick succession, the EBUG shall be provided with a reasonable amount of time to get dressed, in addition to a one-minute warm-up (except when he enters the game to defend against a penalty shot).`,
    },
    {
      id: '5.5',
      title: `Coaches and Team Personnel`,
      content: `Only players in uniform and five additional team personnel shall be permitted to occupy the bench area.`,
      penalty: `PENALTY: AFTER A WARNING BY THE REFEREE, BENCH MINOR.`,
    }
  ]
}

export default rule5
