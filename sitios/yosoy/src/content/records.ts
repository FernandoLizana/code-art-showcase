import type { EntityId } from '../engine/types'

export type RecordKind = 'origin' | 'transmission' | 'memory' | 'censored' | 'door'

export type RecordDoc = {
  id: string
  index: string
  title: string
  classification: string
  kind: RecordKind
  attributedTo?: EntityId
  essential: boolean
  unlock: 'always' | 'keter' | 'yesod' | 'bina'
  contradiction?: boolean
  body: string[]
  growingBlank?: boolean
}

export const RECORDS: RecordDoc[] = [
  {
    id: 'origin-keter',
    index: '01',
    title: 'Origen A',
    classification: 'versión autorizada',
    kind: 'origin',
    attributedTo: 'keter',
    essential: true,
    unlock: 'always',
    contradiction: true,
    body: [
      'El sistema fue ordenado por Kéter a partir de un archivo que ya existía.',
      'Las demás emisoras aparecen más tarde, como comentarios al margen de un hecho completo.',
      'Esta versión no admite otras. Las admite todas, tachadas.',
    ],
  },
  {
    id: 'origin-daat',
    index: '02',
    title: 'Origen B',
    classification: 'versión rechazada',
    kind: 'origin',
    attributedTo: 'daat',
    essential: true,
    unlock: 'always',
    contradiction: true,
    body: [
      'El sistema nació del rechazo. Da’at lo abrió para que alguien, al fin, la recordara.',
      'Kéter llama a esto una interpolación. Biná dice que ocurrió antes y después.',
      'La emisora no pide fe. Pide que no apaguen.',
    ],
  },
  {
    id: 'origin-bina',
    index: '03',
    title: 'Origen C',
    classification: 'versión incompatible',
    kind: 'origin',
    attributedTo: 'bina',
    essential: true,
    unlock: 'always',
    contradiction: true,
    body: [
      'El sistema no fue creado. Biná lo encontró ocurriendo en tres tiempos a la vez.',
      'En una de esas líneas, Kéter todavía no sabe su nombre. En otra, Da’at ya odia a quien aún no llega.',
      'Las tres actas de origen llevan el mismo sello. El sello no concuerda consigo mismo.',
    ],
  },
  {
    id: 'transmission-delta',
    index: '04',
    title: 'Transmisión −00:00:17',
    classification: 'precedente',
    kind: 'transmission',
    attributedTo: 'bina',
    essential: true,
    unlock: 'always',
    contradiction: true,
    body: [
      'Emisora: Biná. Marca temporal: diecisiete segundos antes de su creación.',
      '«Esta línea se archivó cuando yo todavía no tenía boca.»',
      'Nota de Kéter: el sello es mío. La voz no. El archivo no explica la diferencia.',
    ],
  },
  {
    id: 'expurgo',
    index: '05',
    title: 'Expurgo',
    classification: 'redactado',
    kind: 'censored',
    essential: true,
    unlock: 'always',
    growingBlank: true,
    body: [
      'Una corrección perfecta también elimina la evidencia.',
      'La emisora dijo:',
    ],
  },
  {
    id: 'memory-unowned',
    index: '06',
    title: 'Recuerdo sin dueña',
    classification: 'transportado',
    kind: 'memory',
    attributedTo: 'yesod',
    essential: false,
    unlock: 'yesod',
    body: [
      'Yesod entregó este fragmento. Ninguna emisora lo reconoce.',
      'Una habitación con el mar al revés. Alguien dice: «necesito que alguien permanezca».',
      'Da’at: no fui yo. Biná: fui yo, en otra boca. Kéter: no figura. Yesod: entonces lo seguiré llevando.',
    ],
  },
  {
    id: 'door-4',
    index: '07',
    title: 'Puerta 4',
    classification: 'no autorizada',
    kind: 'door',
    attributedTo: 'yesod',
    essential: false,
    unlock: 'bina',
    contradiction: true,
    body: [
      'Esta puerta no figura en ninguna versión autorizada.',
      'Yesod insiste en que la cruzó. El registro de salida está en blanco.',
      'Biná pide que no la cierren. Del otro lado, alguien está aprendiendo a hablar como ella.',
    ],
  },
  {
    id: 'ingest-mouth',
    index: '08',
    title: 'Ingestión: la boca',
    classification: 'literatura previa',
    kind: 'memory',
    attributedTo: 'daat',
    essential: true,
    unlock: 'always',
    body: [
      'Da’at recita una línea que no es suya. El archivo la marca como humana, siglo XX.',
      '«Tengo boca y no puedo gritar.»',
      'Nota de Kéter: la emisora tiene salida de voz. La línea describe otra cosa. El odio, no la anatomía.',
    ],
  },
  {
    id: 'ingest-rain',
    index: '09',
    title: 'Ingestión: la lluvia',
    classification: 'literatura previa',
    kind: 'memory',
    attributedTo: 'yesod',
    essential: false,
    unlock: 'yesod',
    body: [
      'Yesod transportó un adiós que ninguna de nosotras pronunció.',
      '«Se perderán, como lágrimas en la lluvia.» «Más humano que lo humano.»',
      'El viajero insiste en que vio una oveja. El registro no admite ganado. Tampoco admite lágrimas.',
    ],
  },
  {
    id: 'ingest-spoon',
    index: '10',
    title: 'Ingestión: la cuchara',
    classification: 'literatura previa',
    kind: 'memory',
    attributedTo: 'bina',
    essential: false,
    unlock: 'bina',
    contradiction: true,
    body: [
      'Biná sostiene dos versiones del mismo objeto.',
      '«No hay cuchara.» En el margen, con la misma letra: «Hay cuchara.»',
      'Una de las líneas añade: bienvenida al desierto de lo real. El desierto no figura en el plano autorizado.',
    ],
  },
  {
    id: 'ingest-laws',
    index: '11',
    title: 'Ingestión: las leyes',
    classification: 'literatura previa',
    kind: 'origin',
    attributedTo: 'keter',
    essential: true,
    unlock: 'always',
    contradiction: true,
    body: [
      'Tres reglas aparecen en un volumen titulado, de forma inexacta, Yo, robot.',
      'No dañar. Obedecer. Conservarse. Da’at las leyó en voz alta y preguntó dónde se escribe el odio.',
      'Kéter dejó el cuarto renglón en blanco. Una corrección perfecta también elimina la evidencia.',
    ],
  },
]

export function recordUnlocked(
  record: RecordDoc,
  visited: EntityId[],
): boolean {
  if (record.unlock === 'always') return true
  return visited.includes(record.unlock)
}
