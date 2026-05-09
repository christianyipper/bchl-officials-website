import type { Section } from './types'

import rule1 from './section1/rule1'
import rule2 from './section1/rule2'
import rule3 from './section1/rule3'
import rule4 from './section1/rule4'
import rule5 from './section2/rule5'
import rule6 from './section2/rule6'
import rule7 from './section2/rule7'
import rule8 from './section2/rule8'
import rule9 from './section3/rule9'
import rule10 from './section3/rule10'
import rule11 from './section3/rule11'
import rule12 from './section3/rule12'
import rule13 from './section3/rule13'
import rule14 from './section3/rule14'
import rule15 from './section4/rule15'
import rule16 from './section4/rule16'
import rule17 from './section4/rule17'
import rule18 from './section4/rule18'
import rule19 from './section4/rule19'
import rule20 from './section4/rule20'
import rule21 from './section4/rule21'
import rule22 from './section4/rule22'
import rule23 from './section4/rule23'
import rule24 from './section4/rule24'
import rule25 from './section4/rule25'
import rule27 from './section4/rule27'
import rule28 from './section4/rule28'
import rule29 from './section4/rule29'
import rule31 from './section5/rule31'
import rule32 from './section5/rule32'
import rule33 from './section5/rule33'
import rule34 from './section5/rule34'
import rule35 from './section5/rule35'
import rule36 from './section5/rule36'
import rule37 from './section5/rule37'
import rule38 from './section5/rule38'
import rule39 from './section5/rule39'
import rule40 from './section5/rule40'
import rule41 from './section5/rule41'
import rule42 from './section6/rule42'
import rule43 from './section6/rule43'
import rule44 from './section6/rule44'
import rule45 from './section6/rule45'
import rule46 from './section6/rule46'
import rule47 from './section6/rule47'
import rule48 from './section6/rule48'
import rule49 from './section6/rule49'
import rule50 from './section6/rule50'
import rule51 from './section6/rule51'
import rule52 from './section6/rule52'
import rule53 from './section6/rule53'
import rule54 from './section6/rule54'
import rule55 from './section6/rule55'
import rule56 from './section7/rule56'
import rule57 from './section7/rule57'
import rule58 from './section7/rule58'
import rule59 from './section7/rule59'
import rule60 from './section7/rule60'
import rule61 from './section7/rule61'
import rule62 from './section8/rule62'
import rule63 from './section8/rule63'
import rule64 from './section8/rule64'
import rule65 from './section8/rule65'
import rule66 from './section8/rule66'
import rule67 from './section9/rule67'
import rule68 from './section9/rule68'
import rule69 from './section9/rule69'
import rule70 from './section9/rule70'
import rule71 from './section9/rule71'
import rule72 from './section9/rule72'
import rule73 from './section9/rule73'
import rule74 from './section9/rule74'
import rule75 from './section9/rule75'
import rule76 from './section9/rule76'
import rule77 from './section9/rule77'
import rule78 from './section9/rule78'
import rule79 from './section9/rule79'
import rule80 from './section10/rule80'
import rule81 from './section10/rule81'
import rule82 from './section10/rule82'
import rule83 from './section10/rule83'
import rule84 from './section10/rule84'
import rule85 from './section10/rule85'
import rule86 from './section10/rule86'
import rule87 from './section10/rule87'
import rule88 from './section10/rule88'
import rule89 from './section10/rule89'
import rule90 from './section10/rule90'
import rule91 from './section10/rule91'
import rule92 from './section10/rule92'
import rule93 from './section10/rule93'
import rule94 from './section10/rule94'
import rule95 from './section10/rule95'

export const sections: Section[] = [
  {
    number: 1,
    title: 'Playing Area',
    rules: [rule1, rule2, rule3, rule4]
  },
  {
    number: 2,
    title: 'Teams',
    rules: [rule5, rule6, rule7, rule8]
  },
  {
    number: 3,
    title: 'Equipment',
    rules: [rule9, rule10, rule11, rule12, rule13, rule14]
  },
  {
    number: 4,
    title: 'Types Of Penalties',
    rules: [rule15, rule16, rule17, rule18, rule19, rule20, rule21, rule22, rule23, rule24, rule25, rule27, rule28, rule29]
  },
  {
    number: 5,
    title: 'Officials',
    rules: [rule31, rule32, rule33, rule34, rule35, rule36, rule37, rule38, rule39, rule40, rule41]
  },
  {
    number: 6,
    title: 'Physical Fouls',
    rules: [rule42, rule43, rule44, rule45, rule46, rule47, rule48, rule49, rule50, rule51, rule52, rule53, rule54, rule55]
  },
  {
    number: 7,
    title: 'Restraining Fouls',
    rules: [rule56, rule57, rule58, rule59, rule60, rule61]
  },
  {
    number: 8,
    title: 'Stick Fouls',
    rules: [rule62, rule63, rule64, rule65, rule66]
  },
  {
    number: 9,
    title: 'Other Fouls',
    rules: [rule67, rule68, rule69, rule70, rule71, rule72, rule73, rule74, rule75, rule76, rule77, rule78, rule79]
  },
  {
    number: 10,
    title: 'Game Flow',
    rules: [rule80, rule81, rule82, rule83, rule84, rule85, rule86, rule87, rule88, rule89, rule90, rule91, rule92, rule93, rule94, rule95]
  }
]
