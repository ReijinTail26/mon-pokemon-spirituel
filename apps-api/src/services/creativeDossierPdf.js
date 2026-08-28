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
    })

  try {
    const page =
      await browser.newPage()

    await page.setContent(
      html,
      {
        waitUntil:
          'networkidle',
      }
    )

    const pdfBytes = await page.pdf({
      format:
        'A4',

      printBackground:
        true,

      preferCSSPageSize:
        true,

      margin: {
        top:
          '0mm',

        right:
          '0mm',

        bottom:
          '0mm',

        left:
          '0mm',
      },
    })

    return { html, pdf_bytes: Buffer.from(pdfBytes) }
  } finally {
    await browser.close()
  }
}

module.exports = {
  renderCreativeDossierPdf,
}
