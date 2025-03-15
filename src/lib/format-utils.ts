// Create a utility file for formatting functions
export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) {
    return 'Amount not specified';
  }
  return `$${amount.toLocaleString()}`;
}

export function formatDate(date: string | Date): string {
  if (!date) return 'Date not specified';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 