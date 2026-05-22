/**
 * Automated screenshot tool for Helpdesk TMS
 * Usage:
 *   npm install puppeteer --save-dev   (run once, from project root)
 *   node scripts/take-screenshots.js
 *
 * Requires: frontend running on http://localhost:5173
 *           backend  running on http://localhost:8000
 */

const puppeteer = require('puppeteer')
const path      = require('path')
const fs        = require('fs')

const FRONTEND  = 'http://localhost:5173'
const OUT_DIR   = path.join(__dirname, '..', 'screenshots')
const VIEWPORT  = { width: 1440, height: 900 }
const DELAY_MS  = 1800   // wait for data to load

const pages = [
  { name: 'dashboard',     path: '/',             file: 'dashboard.png' },
  { name: 'ticket-list',   path: '/tickets',      file: 'ticket-list.png' },
  { name: 'create-ticket', path: '/tickets/new',  file: 'create-ticket.png' },
  { name: 'ticket-detail', path: '/tickets/1',    file: 'ticket-detail.png' },
  { name: 'search',        path: '/search',       file: 'search.png' },
]

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

;(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log('🚀 Launching browser…')
  const browser = await puppeteer.launch({ headless: 'new' })
  const page    = await browser.newPage()
  await page.setViewport(VIEWPORT)

  for (const p of pages) {
    console.log(`📸 Capturing: ${p.name}…`)
    await page.goto(`${FRONTEND}${p.path}`, { waitUntil: 'networkidle2' })
    await sleep(DELAY_MS)
    const outPath = path.join(OUT_DIR, p.file)
    await page.screenshot({ path: outPath, fullPage: false })
    console.log(`   ✓ Saved → screenshots/${p.file}`)
  }

  await browser.close()
  console.log('\n✅ All screenshots saved to /screenshots/')
})()
