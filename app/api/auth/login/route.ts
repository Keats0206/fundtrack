import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Ultra-simple fund configuration
// In production, move this to a database or env vars
const FUNDS = {
  'mantis': {
    id: 'mantis',
    name: 'Mantis VC',
    // AI/ML and Gaming focused portfolio
    companies: ['1', '2', '3', '5', '6'], // Superhuman, Stability AI, Mythical Games, Alchemy, Tavus
  },
  'demo': {
    id: 'demo',
    name: 'Apex Ventures',
    // FinTech and Enterprise focused portfolio
    companies: ['4', '7', '8', '9', '10'], // Kalshi, Trace Finance, Step, Utilize, Pocus
  },
  // Add more funds as needed:
  // 'otherfund': { id: 'otherfund', name: 'Other VC', companies: ['company-id-1', 'company-id-2'] },
};

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Check if password matches any fund
    const fund = FUNDS[password.toLowerCase() as keyof typeof FUNDS];

    if (!fund) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('fund_session', JSON.stringify({
      fundId: fund.id,
      fundName: fund.name,
      companies: fund.companies,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      fund: {
        id: fund.id,
        name: fund.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

