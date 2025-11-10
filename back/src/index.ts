import { env } from './infrastructure/config';
import { Database } from './infrastructure/db/mssql';
import { Server } from './presentation/server';
import { seedAdmin } from './infrastructure/db/adminSeeder';

async function bootstrap() {
  const db = Database.getInstance();
  await db.connect();

  await seedAdmin();

  const server = new Server();
  server.listen(env.PORT);
}

bootstrap().catch((e) => {
  console.error('[Bootstrap] fatal', e);
  process.exit(1);
});
