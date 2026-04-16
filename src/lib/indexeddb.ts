import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface UPEstudosDB extends DBSchema {
  sessions: {
    key: string
    value: {
      id: string
      user_id: string
      subject_id: string
      date: string
      started_at: string
      finished_at: string | null
      paused_at: string | null
      duration_minutes: number
      topic: string | null
      notes: string | null
      difficulty: number | null
      focus: number | null
      session_type: string
      is_offline_sync: boolean
      created_at?: string
    }
    indexes: { 'by-date': string; 'by-user': string }
  }
  queue: {
    key: number
    value: {
      id: number
      type: 'create' | 'update' | 'delete'
      table: string
      data: any
      timestamp: number
    }
  }
}

let db: IDBPDatabase<UPEstudosDB> | null = null

export async function initDB() {
  if (db) return db
  db = await openDB<UPEstudosDB>('up_estudos', 2, {
    upgrade(db, oldVersion) {
      // Delete old stores if upgrading from v1 (camelCase schema)
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('sessions')) {
          db.deleteObjectStore('sessions')
        }
        if (db.objectStoreNames.contains('queue')) {
          db.deleteObjectStore('queue')
        }
      }
      const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
      sessionStore.createIndex('by-date', 'date')
      sessionStore.createIndex('by-user', 'user_id')
      db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true })
    },
  })
  return db
}

export async function saveOfflineSession(session: any) {
  const database = await initDB()
  await database.put('sessions', session)
}

export async function getOfflineSessions(userId: string) {
  const database = await initDB()
  return database.getAllFromIndex('sessions', 'by-user', userId)
}

export async function deleteOfflineSession(id: string) {
  const database = await initDB()
  await database.delete('sessions', id)
}

export async function queueSync(type: 'create' | 'update' | 'delete', table: string, data: any) {
  const database = await initDB()
  await database.add('queue', {
    type,
    table,
    data,
    timestamp: Date.now(),
  } as any)
}

export async function getSyncQueue() {
  const database = await initDB()
  return database.getAll('queue')
}

export async function clearSyncQueue() {
  const database = await initDB()
  await database.clear('queue')
}