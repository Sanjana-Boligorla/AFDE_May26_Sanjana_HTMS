/**
 * Automated screenshot tool for Helpdesk TMS (Phase 1 + Phase 2)
 * Usage:
 *   npm install puppeteer --save-dev   (run once, from project root)
 *   node scripts/take-screenshots.js
 *
 * Requires: frontend running on http://localhost:5173
 *           backend  running on http://localhost:8000
 *           ETL pipeline run so historical_tickets has data (for analytics page)
 */

const puppeteer = require('puppeteer')
const path      = require('path')
const fs        = require('fs')

const FRONTEND  = 'http://localhost:5173'
const OUT_DIR   = path.join(__dirname, '..', 'screenshots')
const VIEWPORT  = { width: 1440, height: 900 }
const DELAY_MS  = 2200   // wait for API data to load

const pages = [
  // Phase 1
  { name: 'dashboard',     path: '/',             file: 'dashboard.png'     },
  { name: 'ticket-list',   path: '/tickets',      file: 'ticket-list.png'   },
  { name: 'create-ticket', path: '/tickets/new',  file: 'create-ticket.png' },
  { name: 'ticket-detail', path: '/tickets/1',    file: 'ticket-detail.png' },
  { name: 'search',        path: '/search',       file: 'search.png'        },
  // Phase 2
  { name: 'analytics',     path: '/analytics',    file: 'analytics.png'     },
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
    try {
      await page.goto(`${FRONTEND}${p.path}`, { waitUntil: 'networkidle2', timeout: 15000 })
      await sleep(DELAY_MS)
      const outPath = path.join(OUT_DIR, p.file)
      await page.screenshot({ path: outPath, fullPage: true })
      console.log(`   ✓ Saved → screenshots/${p.file}`)
    } catch (err) {
      console.warn(`   ⚠ Skipped ${p.name}: ${err.message}`)
    }
  }

  await browser.close()
  console.log('\n✅ All screenshots saved to /screenshots/')
  console.log('   Phase 1: dashboard, ticket-list, create-ticket, ticket-detail, search')
  console.log('   Phase 2: analytics')
})()
