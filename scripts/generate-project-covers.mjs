#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

function translate(svg, labels) {
  const translated = new Set()
  const result = svg.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (match, open, text, close) => {
    if (!(text in labels)) return match
    translated.add(text)
    return `${open}${labels[text]}${close}`
  })
  if (translated.size !== Object.keys(labels).length) throw new Error('Project cover source labels changed')
  return result
}

/* `node scripts/generate-project-covers.mjs stackshot` renders one cover; no argument renders them all. */
const selected = new Set(process.argv.slice(2))
const wanted = (key) => !selected.size || selected.has(key)

if (wanted('finance')) {
  const finance = translate(await readFile('src/assets/projects/finance-core.svg', 'utf8'), {
    'PRIVATE / DEMO': 'PRIVADO / DEMO',
    OVERVIEW: 'RESUMEN',
    ACCOUNTS: 'CUENTAS',
    IMPORTS: 'IMPORTACIONES',
    PLANNING: 'PLANIFICACIÓN',
    CRYPTO: 'CRIPTO',
    SPENDING: 'GASTOS',
    'SAVINGS GOALS': 'OBJETIVOS DE AHORRO',
    'REACT / FASTAPI / PRIVATE SOURCE': 'REACT / FASTAPI / CÓDIGO PRIVADO',
  })
  await writeFile('src/assets/projects/finance-core-es.svg', finance)
}

if (wanted('transcriber')) {
  const transcriber = translate(await readFile('scripts/artwork/youtube-transcriber-cover.svg', 'utf8'), {
    CAPTIONS: 'SUBTÍTULOS',
    SENTENCES: 'FRASES',
    'NO CAPTIONS': 'SIN SUBTÍTULOS',
    'EN &#8594; ES  &#183;  CAPTIONS FIRST  &#183;  DEEPL': 'EN &#8594; ES  &#183;  SUBTÍTULOS PRIMERO  &#183;  DEEPL',
    'SSE / STAGE: PREPARING_RESULT': 'SSE / ETAPA: PREPARING_RESULT',
    'SEGMENTS / SENTENCE-ALIGNED': 'SEGMENTOS / FRASES ALINEADAS',
    'PERSISTENCE / BROWSER ONLY': 'PERSISTENCIA / SOLO EN NAVEGADOR',
    'LANG / AUTO': 'IDIOMA / AUTO',
    'EXPORT / TXT SRT': 'EXPORTAR / TXT SRT',
  })
  await writeFile('scripts/artwork/youtube-transcriber-cover-es.svg', transcriber)
  await sharp(Buffer.from(transcriber)).png().toFile('src/assets/projects/youtube-transcriber-es.png')
}

/* Stackshot's English cover is rendered here too: the SVG is its only source. */
if (wanted('stackshot')) {
  const stackshotSource = await readFile('scripts/artwork/stackshot-cover.svg', 'utf8')
  const stackshot = translate(stackshotSource, {
    PRTSC: 'IMPR PANT',
    SELECT: 'SELECCIÓN',
    THUMBNAIL: 'MINIATURA',
    RECORD: 'GRABAR',
    VIDEO: 'VÍDEO',
    'PRTSC  &#183;  SELECT  &#183;  ANNOTATE  &#183;  CTRL+V': 'IMPR PANT  &#183;  SELECCIONA  &#183;  MARCA  &#183;  CTRL+V',
    'Payment details': 'Datos de pago',
    Name: 'Nombre',
    'Jane Example': 'Ana Ejemplo',
    'E-mail': 'Correo',
    Amount: 'Importe',
    '1,240.00 &#8364;': '1.240,00 &#8364;',
    Copy: 'Copiar',
    Save: 'Guardar',
    'ON THE CLIPBOARD': 'EN EL PORTAPAPELES',
    'OCR / ON THIS PC': 'OCR / EN TU EQUIPO',
    'REDACT / IBAN ID E-MAIL': 'TAPAR / IBAN DNI CORREO',
    'TELEMETRY / NONE': 'TELEMETRÍA / NINGUNA',
    'VIDEO / 60 FPS': 'VÍDEO / 60 FPS',
    'LICENSE / MIT': 'LICENCIA / MIT',
  })
  await writeFile('scripts/artwork/stackshot-cover-es.svg', stackshot)
  await sharp(Buffer.from(stackshotSource)).png().toFile('src/assets/projects/stackshot.png')
  await sharp(Buffer.from(stackshot)).png().toFile('src/assets/projects/stackshot-es.png')
}
console.log('Generated the project covers from their editable artwork.')
