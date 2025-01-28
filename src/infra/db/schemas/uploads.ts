import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const uploads = pgTable('uploads', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()), //pegar do pg-core
  name: text('name').notNull(),
  remoteKey: text('remote_key').notNull().unique(), //como se fosse uma pasta
  remoteUrl: text('remote_url').notNull(), // uma url para acessar o arquivo ( para arquivos publicos não criaria esse remoteUrl)
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
