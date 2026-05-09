export interface Subsection {
  id: string
  title: string
  content: string
  penalty?: string
}

export interface Rule {
  number: number
  title: string
  updated?: string
  subsections: Subsection[]
}

export interface Section {
  number: number
  title: string
  rules: Rule[]
}
