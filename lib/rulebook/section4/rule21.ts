import type { Rule } from '../types'

const rule21: Rule = {
  number: 21,
  title: `Misconduct Penalties`,
  subsections: [
    {
      id: '21.1',
      title: `Two Misconduct Penalties in the Same Game`,
      content: `A player that receives 2 misconducts in either of the following or same penalty categories — Illegal Check to the Head and/or Checking from Behind — will be assessed a game misconduct upon their second misconduct. Misconduct penalties under other rules do not apply to the accumulation towards a game misconduct.

• **Example 1:** Player is assessed a minor and misconduct for Checking from Behind and subsequently a minor and misconduct for Illegal Check to the Head later in the game. The player is assessed a game misconduct.
• **Example 2:** Player is assessed a minor and misconduct for Checking from Behind and subsequently a misconduct for Abuse of Officials. The player is not assessed a game misconduct.
• **Rationale:** Misconducts for Illegal Check to the Head and Checking from Behind only accumulate towards a game misconduct.
• **Example 3:** Player is assessed a misconduct for Abuse of Officials and a subsequent misconduct for not wearing a Mouthguard. The player is not assessed a game misconduct.`,
    },
    {
      id: '21.2',
      title: `Misconduct Penalty`,
      content: `A misconduct penalty involves the removal of a player (not a goaltender) from the game for a period of 10 minutes; however, a substitute is permitted to replace that player immediately. A player whose misconduct penalty has expired shall remain in the penalty bench until the next stoppage of play.

When a player receives a minor penalty and a misconduct penalty at the same time, the penalized team shall immediately put a substitute player on the penalty bench and he shall serve the minor penalty without change. Should the opposing team score during the time the minor penalty is being served, the minor penalty shall terminate and the misconduct to the originally penalized player shall start immediately.`,
    },
    {
      id: '21.3',
      title: `Short-Handed`,
      content: `If a minor and/or major penalty is imposed on the same player in addition to the misconduct penalty, the 10-minute misconduct penalty shall be served in addition to the minor and/or major penalty; however, a substitute must enter the penalty bench along with the player receiving the misconduct penalty.`,
    }
  ]
}

export default rule21
