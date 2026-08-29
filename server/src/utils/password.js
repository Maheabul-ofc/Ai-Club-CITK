import bcrypt from 'bcryptjs';

export const hashPassword = async (plaintext) => {
  return await bcrypt.hash(plaintext, 12);
};

export const comparePassword = async (plaintext, hash) => {
  return await bcrypt.compare(plaintext, hash);
};
