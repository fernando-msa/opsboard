import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      organizationId: user.organizationId,
      email: user.email
    });

    await setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return NextResponse.json(
      { error: 'Falha ao autenticar. Verifique DATABASE_URL, JWT_SECRET e migrações do Prisma.' },
      { status: 500 }
    );
  }
}
