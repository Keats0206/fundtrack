import { NextRequest, NextResponse } from 'next/server';
import { getCompanyById } from '@/lib/supabase/companies';
import { scanCompany } from '@/lib/supabase/alerts';
import { generateInsights } from '@/lib/supabase/insights';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    // Get company
    const company = await getCompanyById(companyId);
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Scan for alerts
    const scanResult = await scanCompany(companyId, company.name);

    // Generate insights
    const insights = await generateInsights(companyId, company.name);

    return NextResponse.json({
      success: true,
      company: company.name,
      alertsCreated: scanResult.alertsCreated,
      insightsGenerated: insights.length,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan company' },
      { status: 500 }
    );
  }
}

