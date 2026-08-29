const {
  chromium,
} = require(
  'playwright'
)

const {
  buildCreativeDossierHtml,
} = require(
  './creativeDossierHtml'
)
const { generationJobTimeoutMs } = require('../config/generation')

function memorySnapshot() {
  const memory = process.memoryUsage()
  const megabytes = (value) => Math.round(value / 1024 / 1024)
  return {
    rss_mb: megabytes(memory.rss),
    heap_used_mb: megabytes(memory.heapUsed),
    external_mb: megabytes(memory.external),
  }
}

async function renderCreativeDossierPdf({
  creativeDossier,
}) {
  const html =
    buildCreativeDossierHtml({
      creativeDossier,
    })

  const browser =
    await chromium.launch({
      headless:
        true,
      args: [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
      ],
    })

  let context = null
  let page = null
  let timeoutId = null

  try {
    console.log('PDF rendering started.', { memory: memorySnapshot() })

    const rendering = (async () => {
      context = await browser.newContext()
      page = await context.newPage()

      await page.setContent(html, { waitUntil: 'load' })

      return page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
      })
    })()

    const timeout = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        browser.close().catch(() => {})
        reject(new Error('PDF_RENDER_TIMEOUT'))
      }, generationJobTimeoutMs())
    })

    const pdfBytes = await Promise.race([rendering, timeout])
    console.log('PDF rendering completed.', { memory: memorySnapshot() })

    return { pdf_bytes: pdfBytes }
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    await page?.close().catch(() => {})
    await context?.close().catch(() => {})
    await browser.close().catch(() => {})
  }
}

module.exports = {
  renderCreativeDossierPdf,
}
