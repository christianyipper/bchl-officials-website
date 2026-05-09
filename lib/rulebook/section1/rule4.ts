import type { Rule } from '../types'

const rule4: Rule = {
  number: 4,
  title: `Signal and Timing Devices`,
  subsections: [
    {
      id: '4.1',
      title: `Signal Devices`,
      content: `A suitable sound device, such as a buzzer, horn or siren, must be provided for the use of timekeepers. A backup sound and timing device must be provided by the home team. Electric lights shall be placed behind each goal to indicate the scoring of a goal and expiration of time. A red light shall signify the scoring of a goal. A green light shall signify the expiration of a period.`,
    },
    {
      id: '4.2',
      title: `Timing Devices`,
      content: `An electrical clock, or other timing device, shall be provided for the purpose of keeping the teams, game officials and spectators accurately informed as to all time elements at all stages of the game. Time recording for both game time and penalty time shall show time remaining to be played or served. Time displayed on a clock or timing device shall supersede any disparity with lights or horn signaling the end of a period or game.`,
    }
  ]
}

export default rule4
