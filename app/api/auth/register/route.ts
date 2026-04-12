import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie, signToken } from '@/lib/auth';

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slug || `org-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, organizationName } = body;

    if (!name || !email || !password || !organizationName) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 });
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
      { error: 'Falha ao criar conta. Verifique DATABASE_URL, JWT_SECRET e migrações do Prisma.' },
      { status: 500 }
    );
  }
}
