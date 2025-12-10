import { cookies } from 'next/headers';

export interface FundSession {
  fundId: string;
  fundName: string;
  companies: string[];
}

export async function getSession(): Promise<FundSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('fund_session');

    if (!sessionCookie) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<FundSession> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

export function filterCompaniesByFund<T extends { id: string }>(
  companies: T[],
  session: FundSession | null
): T[] {
  if (!session) return [];
  
  // If fund has access to all companies
  if (session.companies.includes('all')) {
    return companies;
  }

  // Filter by specific company IDs
  return companies.filter(c => session.companies.includes(c.id));
}

