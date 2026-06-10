/**
 * CLI for Firestore user documents (admin SDK — bypasses client security rules).
 *
 * Usage (prefer taskfile):
 *   task db:users:list
 *   task db:users:seed
 *   task db:users:add
 *   task db:users:add EMAIL=demo@velo.io NOME=Demo PERFIL=user EMPRESA=velo
 *   task db:users:remove EMAIL=demo@velo.io
 *   task db:users:passwd EMAIL=demo@velo.io PASSWORD=secret
 */
import 'dotenv/config'
import { getAdminDb } from './lib/firestore-admin'
import { hashPassword } from './lib/password'
import {
  USERS_COLLECTION,
  emailToDocId,
  type FirestoreUser,
} from '../shared/user'

function parseArgs(argv: string[]) {
  const positional = argv.filter(a => !a.startsWith('--'))
  const flags: Record<string, string> = {}
  for (const arg of argv) {
    const m = arg.match(/^--([^=]+)=(.*)$/)
    if (m) flags[m[1]] = m[2]
  }
  return { command: positional[0] ?? 'help', flags }
}

function nowIso() {
  return new Date().toISOString()
}

async function listUsers() {
  const snap = await getAdminDb().collection(USERS_COLLECTION).orderBy('email').get()
  if (snap.empty) {
    console.log('Nenhum usuário em Firestore.')
    return
  }
  console.log(`\n${snap.size} usuário(s):\n`)
  for (const doc of snap.docs) {
    const u = doc.data() as FirestoreUser
    const status = u.enabled ? 'ativo' : 'desativado'
    const senha = u.passwordHash ? 'definida' : 'não definida'
    console.log(`  • e-mail: ${u.email}`)
    console.log(`    nome: ${u.nome}  perfil: ${u.perfil}  empresa: ${u.empresaId}  [${status}]  senha: ${senha}`)
    console.log(`    id: ${doc.id}`)
  }
  console.log()
}

async function addUser(flags: Record<string, string>) {
  const email = flags.email?.trim()
  const nome = flags.nome?.trim()
  const perfil = flags.perfil as FirestoreUser['perfil'] | undefined
  const empresaId = flags.empresa?.trim()

  if (!email || !nome || !perfil || !empresaId) {
    console.error('Uso: npm run db:users:add -- --email=... --nome=... --perfil=user|admin --empresa=...')
    process.exit(1)
  }
  if (perfil !== 'admin' && perfil !== 'user') {
    console.error('perfil deve ser "admin" ou "user"')
    process.exit(1)
  }

  const id = emailToDocId(email)
  const ref = getAdminDb().collection(USERS_COLLECTION).doc(id)
  const existing = await ref.get()
  if (existing.exists) {
    console.error(`Usuário "${email}" já existe (doc id: ${id}).`)
    process.exit(1)
  }

  const ts = nowIso()
  const password = flags.password?.trim()
  const data: FirestoreUser = {
    email: id,
    nome,
    perfil,
    empresaId,
    enabled: flags.enabled !== 'false',
    createdAt: ts,
    updatedAt: ts,
  }
  if (password) data.passwordHash = hashPassword(password)
  await ref.set(data)
  console.log(`Usuário criado: ${email} (${id})${password ? '' : ' — defina a senha com task db:users:passwd'}`)
}

async function removeUser(flags: Record<string, string>) {
  const email = flags.email?.trim()
  if (!email) {
    console.error('Uso: npm run db:users:remove -- --email=...')
    process.exit(1)
  }

  const id = emailToDocId(email)
  const ref = getAdminDb().collection(USERS_COLLECTION).doc(id)
  const existing = await ref.get()
  if (!existing.exists) {
    console.error(`Usuário "${email}" não encontrado.`)
    process.exit(1)
  }

  await ref.delete()
  console.log(`Usuário removido: ${email}`)
}

async function setPassword(flags: Record<string, string>) {
  const email = flags.email?.trim()
  const password = flags.password
  if (!email || !password) {
    console.error('Uso: task db:users:passwd EMAIL=... PASSWORD=...')
    process.exit(1)
  }
  if (password.length < 4) {
    console.error('Senha deve ter pelo menos 4 caracteres.')
    process.exit(1)
  }

  const id = emailToDocId(email)
  const ref = getAdminDb().collection(USERS_COLLECTION).doc(id)
  const existing = await ref.get()
  if (!existing.exists) {
    console.error(`Usuário "${email}" não encontrado.`)
    process.exit(1)
  }

  await ref.update({
    passwordHash: hashPassword(password),
    updatedAt: nowIso(),
  })
  console.log(`Senha atualizada: ${email}`)
}

const SEED_USERS: Array<Omit<FirestoreUser, 'createdAt' | 'updatedAt' | 'passwordHash'> & { password: string }> = [
  {
    email: 'demo@velo.io',
    nome: 'Usuário Demo',
    perfil: 'user',
    empresaId: 'velo',
    enabled: true,
    password: 'demo',
  },
  {
    email: 'admin@velo.io',
    nome: 'Administrador',
    perfil: 'admin',
    empresaId: 'velo',
    enabled: true,
    password: 'admin',
  },
]

async function seedUsers() {
  const db = getAdminDb()
  const ts = nowIso()
  let created = 0
  let updated = 0

  for (const u of SEED_USERS) {
    const id = emailToDocId(u.email)
    const ref = db.collection(USERS_COLLECTION).doc(id)
    const snap = await ref.get()
    const { password, ...fields } = u
    const doc: FirestoreUser = {
      ...fields,
      email: id,
      passwordHash: hashPassword(password),
      createdAt: snap.exists ? (snap.data() as FirestoreUser).createdAt : ts,
      updatedAt: ts,
    }

    if (!snap.exists) {
      await ref.set(doc)
      console.log(`  criado: ${u.email}`)
      created++
    } else {
      await ref.set(doc)
      console.log(`  atualizado: ${u.email} (campos + senha padrão)`)
      updated++
    }
  }

  console.log(`\nSeed concluído — ${created} criado(s), ${updated} atualizado(s).`)
}

async function resetUsers() {
  const db = getAdminDb()
  const snap = await db.collection(USERS_COLLECTION).get()
  if (!snap.empty) {
    const batch = db.batch()
    snap.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
    console.log(`Removidos ${snap.size} usuário(s).`)
  } else {
    console.log('Coleção users já estava vazia.')
  }
  await seedUsers()
}

function printHelp() {
  console.log(`
Firestore users CLI

  task db:users:list
  task db:users:seed
  task db:users:add
  task db:users:remove
  task db:users:passwd
  task db:users:reset

Requer firebase-service-account.json na raiz do projeto (gitignored).
`)
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2))

  switch (command) {
    case 'list':   return listUsers()
    case 'add':    return addUser(flags)
    case 'remove': return removeUser(flags)
    case 'passwd': return setPassword(flags)
    case 'seed':   return seedUsers()
    case 'reset':  return resetUsers()
    default:
      printHelp()
      process.exit(command === 'help' ? 0 : 1)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
