export type BackgroundTheme = {
  id: string
  name: string
  image: string

  accent: string
  accentStrong: string
  accentSoft: string

  overlayTop: string
  overlayBottom: string
}

export const BACKGROUNDS: BackgroundTheme[] = [
  {
    id: 'sunset-reflection',
    name: 'Coucher de soleil — Réflexion',

    image:
      '/backgrounds/bg-01-sunset-reflection.png',

    accent: '#ff735c',
    accentStrong: '#ffb36b',
    accentSoft:
      'rgba(255, 115, 92, 0.22)',

    overlayTop:
      'rgba(20, 8, 18, 0.20)',

    overlayBottom:
      'rgba(10, 5, 14, 0.62)',
  },

  {
    id: 'tropical-lagoon',
    name: 'Lagon tropical',

    image:
      '/backgrounds/bg-02-tropical-lagoon.png',

    accent: '#35d4e7',
    accentStrong: '#75edda',
    accentSoft:
      'rgba(53, 212, 231, 0.22)',

    overlayTop:
      'rgba(3, 21, 32, 0.18)',

    overlayBottom:
      'rgba(3, 18, 28, 0.60)',
  },

  {
    id: 'enchanted-forest',
    name: 'Forêt enchantée',

    image:
      '/backgrounds/bg-03-enchanted-forest.png',

    accent: '#62d98c',
    accentStrong: '#a1eda6',
    accentSoft:
      'rgba(98, 217, 140, 0.22)',

    overlayTop:
      'rgba(4, 22, 18, 0.18)',

    overlayBottom:
      'rgba(3, 15, 14, 0.64)',
  },

  {
    id: 'aurora',
    name: 'Aurores boréales',

    image:
      '/backgrounds/bg-04-aurora.png',

    accent: '#9b6cff',
    accentStrong: '#61ead8',
    accentSoft:
      'rgba(155, 108, 255, 0.24)',

    overlayTop:
      'rgba(8, 8, 30, 0.16)',

    overlayBottom:
      'rgba(5, 6, 24, 0.66)',
  },

  {
    id: 'snow-mountain-dawn',
    name:
      'Montagne enneigée — Aube',

    image:
      '/backgrounds/bg-05-snow-mountain-dawn.png',

    accent: '#ec8fc6',
    accentStrong: '#ffd1ad',
    accentSoft:
      'rgba(236, 143, 198, 0.22)',

    overlayTop:
      'rgba(27, 15, 34, 0.17)',

    overlayBottom:
      'rgba(10, 12, 28, 0.61)',
  },

  {
    id: 'night-city',
    name: 'Ville nocturne',

    image:
      '/backgrounds/bg-06-night-city.png',

    accent: '#557bff',
    accentStrong: '#ad76ff',
    accentSoft:
      'rgba(85, 123, 255, 0.24)',

    overlayTop:
      'rgba(3, 8, 29, 0.18)',

    overlayBottom:
      'rgba(2, 5, 20, 0.68)',
  },

  {
    id: 'golden-desert',
    name: 'Désert doré',

    image:
      '/backgrounds/bg-07-golden-desert.png',

    accent: '#e99b45',
    accentStrong: '#ffd27c',
    accentSoft:
      'rgba(233, 155, 69, 0.22)',

    overlayTop:
      'rgba(31, 17, 7, 0.18)',

    overlayBottom:
      'rgba(22, 10, 4, 0.62)',
  },

  {
    id: 'crystal-river',
    name: 'Rivière cristalline',

    image:
      '/backgrounds/bg-08-crystal-river.png',

    accent: '#36c8c9',
    accentStrong: '#81efcf',
    accentSoft:
      'rgba(54, 200, 201, 0.22)',

    overlayTop:
      'rgba(3, 22, 23, 0.16)',

    overlayBottom:
      'rgba(3, 17, 20, 0.62)',
  },

  {
    id: 'luminous-caves',
    name: 'Grottes luminescentes',

    image:
      '/backgrounds/bg-09-luminous-caves.png',

    accent: '#4e9cff',
    accentStrong: '#b16cff',
    accentSoft:
      'rgba(78, 156, 255, 0.24)',

    overlayTop:
      'rgba(4, 5, 25, 0.14)',

    overlayBottom:
      'rgba(3, 4, 20, 0.68)',
  },

  {
    id: 'volcano-lava',
    name: 'Volcans et lave',

    image:
      '/backgrounds/bg-10-volcano-lava.png',

    accent: '#ff5843',
    accentStrong: '#ff9c49',
    accentSoft:
      'rgba(255, 88, 67, 0.24)',

    overlayTop:
      'rgba(29, 4, 4, 0.18)',

    overlayBottom:
      'rgba(18, 3, 4, 0.65)',
  },

  {
    id: 'tropical-beach-twilight',
    name:
      'Plage tropicale — Crépuscule',

    image:
      '/backgrounds/bg-11-tropical-beach-twilight.png',

    accent: '#c36bff',
    accentStrong: '#ff8fbd',
    accentSoft:
      'rgba(195, 107, 255, 0.23)',

    overlayTop:
      'rgba(15, 7, 30, 0.16)',

    overlayBottom:
      'rgba(10, 5, 22, 0.63)',
  },

  {
    id: 'flower-fields',
    name: 'Champs fleuris',

    image:
      '/backgrounds/bg-12-flower-field.png',

    accent: '#ef71bc',
    accentStrong: '#ffb561',
    accentSoft:
      'rgba(239, 113, 188, 0.22)',

    overlayTop:
      'rgba(26, 12, 24, 0.16)',

    overlayBottom:
      'rgba(17, 8, 18, 0.60)',
  },

  {
    id: 'ancestral-temple',
    name: 'Temple ancestral',

    image:
      '/backgrounds/bg-13-ancestral-temple.png',

    accent: '#daa95e',
    accentStrong: '#ffe09a',
    accentSoft:
      'rgba(218, 169, 94, 0.22)',

    overlayTop:
      'rgba(21, 18, 8, 0.17)',

    overlayBottom:
      'rgba(12, 12, 6, 0.65)',
  },

  {
    id: 'mystical-cliffs',
    name: 'Falaises mystiques',

    image:
      '/backgrounds/bg-14-mystical-cliffs.png',

    accent: '#75a6d8',
    accentStrong: '#c2daf5',
    accentSoft:
      'rgba(117, 166, 216, 0.22)',

    overlayTop:
      'rgba(8, 15, 24, 0.18)',

    overlayBottom:
      'rgba(5, 10, 18, 0.66)',
  },

  {
    id: 'cosmic-space',
    name: 'Espace cosmique',

    image:
      '/backgrounds/bg-15-cosmic-space.png',

    accent: '#8f7cff',
    accentStrong: '#c7b8ff',
    accentSoft:
      'rgba(143, 124, 255, 0.24)',

    overlayTop:
      'rgba(4, 5, 24, 0.15)',

    overlayBottom:
      'rgba(3, 4, 18, 0.68)',
  },

]

export function getRandomBackground(
  previousBackgroundId?: string | null
):
  BackgroundTheme {
  const available =
    previousBackgroundId
      ? BACKGROUNDS.filter(
          (background) =>
            background.id !==
            previousBackgroundId
        )
      : BACKGROUNDS

  const index =
    Math.floor(
      Math.random() *
        available.length
    )

  return available[index]
}

export function getBackgroundById(
  id: string | null
):
  BackgroundTheme | null {
  if (!id) {
    return null
  }

  return (
    BACKGROUNDS.find(
      (background) =>
        background.id === id
    ) ?? null
  )
}

const PAGE_BACKGROUND_KEY = 'pageSessionBackgroundId'
let cachedPageBackground: BackgroundTheme | null = null

export function getPageSessionBackground(): BackgroundTheme {
  if (cachedPageBackground) return cachedPageBackground

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const isReload = navigation?.type === 'reload'
  const storedId = isReload ? null : sessionStorage.getItem(PAGE_BACKGROUND_KEY)
  const storedBackground = getBackgroundById(storedId)

  if (storedBackground) {
    cachedPageBackground = storedBackground
    return storedBackground
  }

  const selected = getRandomBackground(localStorage.getItem('lastBackgroundId'))
  cachedPageBackground = selected
  sessionStorage.setItem(PAGE_BACKGROUND_KEY, selected.id)
  localStorage.setItem('lastBackgroundId', selected.id)
  return selected
}
