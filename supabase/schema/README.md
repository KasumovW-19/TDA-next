# Supabase database

## Восстановление схемы

В Supabase открыть:

SQL Editor → New query

Выполнить по порядку:

1. `supabase/schema/001_initial_schema.sql`
2. `supabase/schema/002_rls_and_grants.sql`

После этого загрузить стартовые товары:

```bash
npm run seed:products