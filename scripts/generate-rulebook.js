#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const HTML_PATH = 'C:/Users/chris/Downloads/bchl-rulebook-2025-26.html'
const OUT_ROOT = path.join(__dirname, '..', 'lib', 'rulebook')

const html = fs.readFileSync(HTML_PATH, 'utf8')

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'").replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ')
}

// Convert HTML content to structured text:
// - <p> boundaries become double newlines
// - inline tags stripped
// - bullet markers preserved
function extractStructured(html) {
  // Replace closing </p> with paragraph separator before stripping tags
  let text = html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  text = decodeEntities(text)
  // Normalise whitespace within each paragraph but keep paragraph breaks
  text = text
    .split('\n\n')
    .map(para => para.replace(/[ \t]+/g, ' ').trim())
    .filter(para => para.length > 0)
    .join('\n\n')
  return text
}

function extractTitle(str) {
  return decodeEntities(str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

// Split on ALL PENALTY occurrences, returning { main, penalties[] }
// penalties is an array of strings (without the leading "PENALTY—" marker)
function extractPenalties(content) {
  const penaltyRe = /PENALTY\s*[—–\-:]+\s*/gi
  const indices = []
  let m
  while ((m = penaltyRe.exec(content)) !== null) {
    indices.push({ start: m.index, end: m.index + m[0].length })
  }
  if (indices.length === 0) return { main: content.trim(), penalties: [] }

  const main = content.slice(0, indices[0].start).trim()
  const penalties = []
  for (let i = 0; i < indices.length; i++) {
    const segEnd = i + 1 < indices.length ? indices[i + 1].start : content.length
    penalties.push(content.slice(indices[i].end, segEnd).trim())
  }
  return { main, penalties }
}

// Reassemble penalties array into a single penalty string for the field
function buildPenaltyField(penalties) {
  if (penalties.length === 0) return undefined
  if (penalties.length === 1) return 'PENALTY: ' + penalties[0]
  return penalties.map((p, i) => `PENALTY ${i + 1}: ${p}`).join('\n\n')
}

function esc(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

// ---- parse ---------------------------------------------------------------

const sectionChunks = html.split(/<div id="section_(\d+)" class="section-page"/)
const sectionData = []

for (let i = 1; i < sectionChunks.length; i += 2) {
  const sectionNum = parseInt(sectionChunks[i])
  const sectionHtml = sectionChunks[i + 1] || ''

  const titleMatch = sectionHtml.match(/<h1 class="section-title">([\s\S]*?)<\/h1>/)
  const sectionTitle = titleMatch ? extractTitle(titleMatch[1]) : `Section ${sectionNum}`

  const ruleChunks = sectionHtml.split(/<div id="rule_(\d+)" class="rule-block">/)
  const rules = []

  for (let j = 1; j < ruleChunks.length; j += 2) {
    const ruleNum = parseInt(ruleChunks[j])
    const ruleHtml = ruleChunks[j + 1] || ''

    const ruleTitleMatch = ruleHtml.match(/<span class="rule-number">Rule \d+<\/span>([\s\S]*?)<\/h2>/)
    const ruleTitle = ruleTitleMatch ? extractTitle(ruleTitleMatch[1]) : `Rule ${ruleNum}`

    const subruleChunks = ruleHtml.split(/<div class="subrule" id="sub_\d+_\d+">/)
    const subsections = []
    const seenIds = new Set()

    for (let k = 1; k < subruleChunks.length; k++) {
      const srHtml = subruleChunks[k]
      if (srHtml.includes('empty-content')) continue

      const numMatch = srHtml.match(/<span class="subrule-num">([\d.]+)<\/span>/)
      if (!numMatch) continue
      const subId = numMatch[1]
      if (seenIds.has(subId)) continue
      seenIds.add(subId)

      const titleMatch2 = srHtml.match(/<span class="subrule-title">([\s\S]*?)<\/span>/)
      let subTitle = titleMatch2 ? extractTitle(titleMatch2[1]) : ''

      const contentMatch = srHtml.match(/<div class="subrule-content">([\s\S]*?)<\/div>/)
      const rawHtml = contentMatch ? contentMatch[1] : ''
      const rawText = extractStructured(rawHtml)

      // If title is empty, try to use the first short paragraph as the title
      let textForPenalty = rawText
      if (!subTitle) {
        const paras = rawText.split('\n\n')
        if (paras.length > 1 && paras[0].length < 80 && !paras[0].includes('PENALTY')) {
          subTitle = paras[0]
          textForPenalty = paras.slice(1).join('\n\n')
        }
      }

      const { main, penalties } = extractPenalties(textForPenalty)
      const penaltyField = buildPenaltyField(penalties)

      const sub = { id: subId, title: subTitle, content: main }
      if (penaltyField) sub.penalty = penaltyField
      subsections.push(sub)
    }

    if (subsections.length > 0) {
      rules.push({ number: ruleNum, title: ruleTitle, subsections })
    }
  }

  if (rules.length > 0) {
    sectionData.push({ number: sectionNum, title: sectionTitle, rules })
  }
}

console.log(`Parsed ${sectionData.length} sections`)
sectionData.forEach(s => {
  console.log(`  Section ${s.number} (${s.title}): ${s.rules.length} rules`)
})

// ---- write ---------------------------------------------------------------

// Rules manually maintained — skip regenerating these
const SKIP_RULES = new Set([50])

for (const section of sectionData) {
  const dir = path.join(OUT_ROOT, `section${section.number}`)
  fs.mkdirSync(dir, { recursive: true })

  for (const rule of section.rules) {
    if (SKIP_RULES.has(rule.number)) {
      console.log(`  Skipping rule ${rule.number} (manually maintained)`)
      continue
    }

    const subsLines = rule.subsections.map(sub => {
      const penaltyLine = sub.penalty ? `\n      penalty: \`${esc(sub.penalty)}\`,` : ''
      return `    {
      id: '${sub.id}',
      title: \`${esc(sub.title)}\`,
      content: \`${esc(sub.content)}\`,${penaltyLine}
    }`
    }).join(',\n')

    const content = `import type { Rule } from '../types'

const rule${rule.number}: Rule = {
  number: ${rule.number},
  title: \`${esc(rule.title)}\`,
  subsections: [
${subsLines}
  ]
}

export default rule${rule.number}
`
    fs.writeFileSync(path.join(dir, `rule${rule.number}.ts`), content)
  }
}

// index.ts unchanged — already correct
console.log('Done!')
