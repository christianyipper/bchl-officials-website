import type { Rule } from '../types'

const rule6: Rule = {
  number: 6,
  title: `Captain and Alternate Captains`,
  subsections: [
    {
      id: '6.1',
      title: `Captain`,
      content: `One game captain shall be appointed by each team, and shall be the only player to have the privilege of discussing with the referee any questions relating to interpretation of rules that may arise during the progress of a game. The captain should wear the letter “C,’’ approximately 3 inches in height and in contrasting color, in a conspicuous position on the front of the jersey. The referee and official scorer shall be advised before the start of each game of the name of the captain of the team and the designated alternate.`,
    },
    {
      id: '6.2',
      title: `Alternate Captain`,
      content: `A team can list a maximum of 3 alternate captains. A team can list 3 alternates if they do not select a captain.`,
    },
    {
      id: '6.3',
      title: `Captain’s Privileges`,
      content: `The captain may not dispute a judgment decision of the referee.`,
      penalty: `PENALTY: Misconduct. For further violation, game misconduct.

A goalkeeper shall not be entitled to exercise the privileges of captain. During an altercation, the captain may not exercise his privileges until the referee has entered the referee's crease.`,
    }
  ]
}

export default rule6
