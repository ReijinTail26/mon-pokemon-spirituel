function normalizeHex(
  hex
) {
  const value =
    String(hex ?? '')
      .replace('#', '')

  if (
    !/^[0-9A-Fa-f]{6}$/.test(
      value
    )
  ) {
    return '808080'
  }

  return value
}

function hexToRgb(
  hex
) {
  const value =
    normalizeHex(hex)

  return {
    r:
      parseInt(
        value.slice(0, 2),
        16
      ),

    g:
      parseInt(
        value.slice(2, 4),
        16
      ),

    b:
      parseInt(
        value.slice(4, 6),
        16
      ),
  }
}

function rgbToHex({
  r,
  g,
  b,
}) {
  function part(
    value
  ) {
    return Math.round(
      Math.max(
        0,
        Math.min(
          255,
          value
        )
      )
    )
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
  }

  return `#${part(r)}${part(g)}${part(b)}`
}

function transformColor(
  hex,
  offset
) {
  const {
    r,
    g,
    b,
  } = hexToRgb(hex)

  /*
    Rotation simple et déterministe
    des composantes.

    Ce n'est PAS une modification
    anatomique : uniquement palette.
  */

  if (
    offset % 3 === 0
  ) {
    return rgbToHex({
      r: g,
      g: b,
      b: r,
    })
  }

  if (
    offset % 3 === 1
  ) {
    return rgbToHex({
      r:
        255 - r * 0.65,

      g:
        255 - g * 0.65,

      b:
        255 - b * 0.65,
    })
  }

  return rgbToHex({
    r:
      b * 0.75 + 50,

    g:
      r * 0.75 + 50,

    b:
      g * 0.75 + 50,
  })
}

function createShinyPalette({
  palette,
  seed = 0,
}) {
  const offset =
    Math.abs(
      Number(seed) || 0
    ) % 3

  return {
    primary:
      transformColor(
        palette?.primary,
        offset
      ),

    secondary:
      transformColor(
        palette?.secondary,
        offset + 1
      ),

    accent:
      transformColor(
        palette?.accent,
        offset + 2
      ),

    energy:
      transformColor(
        palette?.energy,
        offset + 1
      ),

    transformation_family:
      [
        'hue_shift',
        'nocturnal',
        'mineral',
      ][offset],
  }
}

module.exports = {
  createShinyPalette,
}