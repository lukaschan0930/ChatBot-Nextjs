import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-at-least-32-characters'
);

export async function generateConfirmationToken(email: string, provider = "email"): Promise<string> {
  const token = await new SignJWT({ email, provider })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(SECRET_KEY);

  return token;
}

export async function verifyConfirmationToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (e) {
    console.log(e);
    return null;
  }
}