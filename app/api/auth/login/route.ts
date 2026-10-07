import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie, signToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Aguarde um momento antes de tentar novamente.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password || password.length > 72) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    if (user.passwordHash === 'GOOGLE_AUTH') {
      return NextResponse.json(
        { error: 'Esta conta utiliza login com Google. Por favor, entre com o Google.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
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
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
