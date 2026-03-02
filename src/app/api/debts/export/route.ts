import { getRouteSession, unauthorized } from '@/lib/route-helpers';
import { exportDebtsCSV } from '@/services/debt.service';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { searchParams } = request.nextUrl;
  const filters = {
    cardId: searchParams.get('cardId') ?? undefined,
    personCompanyId: searchParams.get('personCompanyId') ?? undefined,
    assetId: searchParams.get('assetId') ?? undefined,
    month: searchParams.get('month') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    showArchived: searchParams.get('showArchived') === 'true',
  };

  const csv = await exportDebtsCSV(session.userId, filters);

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="dividas-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
