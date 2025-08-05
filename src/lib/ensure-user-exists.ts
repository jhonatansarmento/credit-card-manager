// src/lib/ensure-user-exists.ts
'use server';

import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function ensureUserExists(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('User not authenticated');

  const exists = await prisma.user.findUnique({ where: { id: userId } });

  if (!exists) {
    await prisma.user.create({
      data: {
        id: userId,
        // você pode adicionar email, nome etc. se quiser
      },
    });
    console.log(`✅ Usuário ${userId} criado no banco`);
  }

  return userId;
}
