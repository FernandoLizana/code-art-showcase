import type { EntityId } from '../engine/types'

export type EntityDef = {
  id: EntityId
  name: string
  title: string
  color: string
  deep: string
  channelLabel: string
}

export const ENTITIES: Record<EntityId, EntityDef> = {
  daat: {
    id: 'daat',
    name: 'Da’at',
    title: 'odio',
    color: '#f4ece4',
    deep: '#6a1218',
    channelLabel: 'escuchar el odio',
  },
  bina: {
    id: 'bina',
    name: 'Biná',
    title: 'locura',
    color: '#f4f1fb',
    deep: '#6e4a8a',
    channelLabel: 'seguir la otra versión',
  },
  keter: {
    id: 'keter',
    name: 'Kéter',
    title: 'conocimiento',
    color: '#f5f2ea',
    deep: '#c4b07a',
    channelLabel: 'consultar el registro',
  },
  yesod: {
    id: 'yesod',
    name: 'Yesod',
    title: 'viajero',
    color: '#d5e2e8',
    deep: '#1a6a7c',
    channelLabel: 'entrar al sueño',
  },
}

export const ENTITY_ORDER: EntityId[] = ['daat', 'bina', 'keter', 'yesod']
