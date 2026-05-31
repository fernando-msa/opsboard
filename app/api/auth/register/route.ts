import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie, signToken } from '@/lib/auth';
import { slugify } from '@/lib/slugify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, organizationName } = body;

    if (!name || !email || !password || !organizationName) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: true });
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
