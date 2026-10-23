import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  return session?.user && (role === 'ADMIN' || role === 'SUPER_ADMIN');
}

// GET — semua paket
export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const packages = await prisma.package.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const parsed = packages.map((p) => ({
    ...p,
    facilities: JSON.parse(p.facilities),
  }));

  return NextResponse.json(parsed);
}

// POST — tambah paket baru
export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, basePrice, imageUrl, category, facilities } = body;

    if (!name || !description || !basePrice || !imageUrl || !category || !facilities) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const exists = await prisma.package.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json({ error: 'Nama paket sudah ada' }, { status: 400 });
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        slug,
        description,
        basePrice: parseInt(basePrice),
        imageUrl,
        category,
        facilities: JSON.stringify(facilities),
      },
    });

    return NextResponse.json(pkg);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}