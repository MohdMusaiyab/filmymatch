import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

// Hash a password or Security Answer
export async function hashData(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Compare a password / Security Answer with a hash
export async function verifyData(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}