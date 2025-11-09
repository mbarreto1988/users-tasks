import { Database } from './mssql';
import { AuthRepository } from '../repositories/auth/authRepository';

async function test() {
  const db = Database.getInstance();
  const repo = new AuthRepository(db);
  const user = await repo.findByEmail('mati@example.com');
  console.log('User found:', user);
}

test();
