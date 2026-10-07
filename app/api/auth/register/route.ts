import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie, signToken } from '@/lib/auth';
import { slugify } from '@/lib/slugify';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Limite de cadastros excedido. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const organizationName = typeof body?.organizationName === 'string' ? body.organizationName.trim() : '';

    if (!name || !email || !password || !organizationName) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: 'Nome deve ter entre 2 e 100 caracteres.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'E-mail em formato inválido.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'A senha deve conter no mínimo 8 caracteres.' }, { status: 400 });
    }
    if (password.length > 72) {
      return NextResponse.json({ error: 'A senha deve conter no máximo 72 caracteres.' }, { status: 400 });
    }

    if (organizationName.length < 2 || organizationName.length > 100) {
      return NextResponse.json({ error: 'Nome da organização deve ter entre 2 e 100 caracteres.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
    }

    const baseSlug = slugify(organizationName);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      count += 1;
      slug = `${baseSlug}-${count}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const org = await prisma.organization.create({
      data: {
        name: organizationName,
        slug,
        users: {
          create: { name, email, passwordHash }
        },
        services: {
          create: [{ name: 'API' }, { name: 'Aplicação Web' }, { name: 'Banco de Dados' }]
        }
      },
      include: { users: true }
    });

    const user = org.users[0];
    const token = await signToken({ userId: user.id, organizationId: org.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('REGISTER_ERROR', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
