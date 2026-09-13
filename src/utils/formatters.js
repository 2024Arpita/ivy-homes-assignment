export function formatPrice(amount) {
  if (amount == null) return 'N/A';
  if (amount < 0) return `-₹${Math.abs(amount).toLocaleString('en-IN')}`;
  
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2);
    return `₹${lk} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatArea(sqft) {
  if (sqft == null) return 'N/A';
  return `${sqft.toLocaleString('en-IN')} sq.ft`;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}
