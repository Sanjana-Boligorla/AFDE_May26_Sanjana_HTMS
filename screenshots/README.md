# Screenshots

Run the automated screenshot script (requires both servers running):

```bash
# From project root — install puppeteer once:
npm install puppeteer --save-dev

# Then capture all pages:
node scripts/take-screenshots.js
```

This generates:
- `dashboard.png`
- `ticket-list.png`
- `create-ticket.png`
- `ticket-detail.png`
- `search.png`
