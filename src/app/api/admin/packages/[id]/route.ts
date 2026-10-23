import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  return session?.user && (role === 'ADMIN' || role === 'SUPER_ADMIN');
}

// PUT — update paket
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, basePrice, imageUrl, category, facilities } = body;

    const updated = await prisma.package.update({
      where: { id: params.id },
      data: {
        name,
        description,
        basePrice: parseInt(basePrice),
        imageUrl,
        category,
        facilities: JSON.stringify(facilities),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — hapus paket
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    await prisma.package.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}