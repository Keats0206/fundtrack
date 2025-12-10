import { NextRequest, NextResponse } from 'next/server';
import { searchCompanyEmployees, transformLinkedInProfile } from '@/lib/linkedin-api';
import { detectStealthSignals } from '@/lib/stealth-detector';
import { mockPeople } from '@/lib/simple-mock-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const company = searchParams.get('company');
  const role = searchParams.get('role') || undefined;
  const location = searchParams.get('location') || undefined;
  const useMock = searchParams.get('mock') === 'true';

  if (!company) {
    return NextResponse.json(
      { error: 'Company parameter is required' },
      { status: 400 }
    );
  }

  try {

    // Use mock data if API isn't configured correctly yet
    if (useMock || !process.env.RAPIDAPI_KEY) {
      console.log('Using mock data');
      const filteredMock = mockPeople.filter(
        (person) =>
          person.previousCompany?.toLowerCase().includes(company.toLowerCase())
      );
      
      return NextResponse.json({
        success: true,
        data: filteredMock,
        total: filteredMock.length,
        mock: true,
      });
    }

    // Fetch from LinkedIn API
    const response = await searchCompanyEmployees({
      company,
      role,
      location,
      limit: 100,
    });

    if (!response.success) {
      console.error('LinkedIn API failed, falling back to mock data');
      // Fallback to mock data if API fails
      const filteredMock = mockPeople.filter(
        (person) =>
          person.previousCompany?.toLowerCase().includes(company.toLowerCase())
      );
      
      return NextResponse.json({
        success: true,
        data: filteredMock,
        total: filteredMock.length,
        mock: true,
        apiError: response.message,
      });
    }

    // Transform and detect stealth signals
    const transformedProfiles = response.data.map((profile) => {
      const person = transformLinkedInProfile(profile);
      const stealthData = detectStealthSignals(person);
      return {
        ...person,
        ...stealthData,
      };
    });

    // Filter to only show people with stealth indicators
    const stealthProfiles = transformedProfiles.filter(
      (profile) => profile.stealthIndicators.length > 0
    );

    return NextResponse.json({
      success: true,
      data: stealthProfiles,
      total: stealthProfiles.length,
      mock: false,
    });
  } catch (error) {
    console.error('API route error:', error);
    
    // Fallback to mock data on any error
    const filteredMock = mockPeople.filter(
      (person) =>
        person.previousCompany?.toLowerCase().includes(company.toLowerCase())
    );
    
    return NextResponse.json({
      success: true,
      data: filteredMock,
      total: filteredMock.length,
      mock: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}