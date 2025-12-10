import { Person } from './simple-types';

/**
 * Convert array of Person objects to CSV string
 */
export function generateCSV(people: Person[]): string {
  const headers = [
    'Name',
    'Current Title',
    'Current Company',
    'Previous Title',
    'Previous Company',
    'Location',
    'LinkedIn URL',
    'Stealth Indicators',
    'Last Updated',
  ];

  const rows = people.map((person) => [
    escapeCsvValue(person.name),
    escapeCsvValue(person.currentTitle),
    escapeCsvValue(person.company),
    escapeCsvValue(person.previousTitle || ''),
    escapeCsvValue(person.previousCompany || ''),
    escapeCsvValue(person.location),
    escapeCsvValue(person.linkedinUrl),
    escapeCsvValue(person.stealthIndicators.join('; ')),
    person.lastUpdated.toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape CSV values that contain commas, quotes, or newlines
 */
function escapeCsvValue(value: string): string {
  if (!value) return '';
  
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(people: Person[], filename = 'stealth-founders.csv'): void {
  const csvContent = generateCSV(people);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Format data for Apollo.io import
 * Apollo expects: First Name, Last Name, Title, Company, LinkedIn URL
 */
export function generateApolloCSV(people: Person[]): string {
  const headers = [
    'First Name',
    'Last Name',
    'Title',
    'Company',
    'LinkedIn URL',
    'Location',
  ];

  const rows = people.map((person) => {
    const nameParts = person.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return [
      escapeCsvValue(firstName),
      escapeCsvValue(lastName),
      escapeCsvValue(person.currentTitle),
      escapeCsvValue(person.company),
      escapeCsvValue(person.linkedinUrl),
      escapeCsvValue(person.location),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV formatted for Apollo.io
 */
export function downloadApolloCSV(people: Person[], filename = 'apollo-import.csv'): void {
  const csvContent = generateApolloCSV(people);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

