import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setAuthCookie, signToken } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/firebase-admin';

function makeOrgName(email: string, displayName?: string | null) {
  if (displayName) return `${displayName} Org`;
  const domain = email.split('@')[1] ?? 'empresa';
  return domain.split('.')[0];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `org-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'idToken é obrigatório.' }, { status: 400 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    const email = decoded.email;

    if (!email) {
      return NextResponse.json({ error: 'Conta Google sem e-mail disponível.' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const organizationName = makeOrgName(email, decoded.name);
      const baseSlug = slugify(organizationName);
      let slug = baseSlug;
      let count = 1;
      while (await prisma.organization.findUnique({ where: { slug } })) {
        count += 1;
        slug = `${baseSlug}-${count}`;
      }

      const org = await prisma.organization.create({
        data: {
          name: organizationName,
          slug,
          users: {
            create: {
              name: decoded.name || email.split('@')[0],
              email,
              passwordHash: 'GOOGLE_AUTH'
            }
          },
          services: {
            create: [{ name: 'API' }, { name: 'Aplicação Web' }, { name: 'Banco de Dados' }]
          }
        },
        include: { users: true }
      });

      user = org.users[0];
    }

    const token = await signToken({
      userId: user.id,
      organizationId: user.organizationId,
      email: user.email
    });

    await setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('GOOGLE_AUTH_ERROR', error);
    return NextResponse.json({ error: 'Falha na autenticação Google.' }, { status: 500 });
  }
}
