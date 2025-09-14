import { ServiceRecord, DashboardStats } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

export const calculateProfit = (fee: number, expense: number): number => {
  return fee - expense;
};

export const calculateDashboardStats = (
  services: ServiceRecord[]
): DashboardStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyServices = services.filter(service => {
    const serviceDate = service.createdAt ? new Date(service.createdAt) : new Date(service.date || '');
    return serviceDate.getMonth() === currentMonth && 
           serviceDate.getFullYear() === currentYear;
  });

  const yearlyServices = services.filter(service => {
    const serviceDate = service.createdAt ? new Date(service.createdAt) : new Date(service.date || '');
    return serviceDate.getFullYear() === currentYear;
  });

  const totalServices = services.length;
  const totalRevenue = services.reduce((sum, service) => sum + (service.cost || service.feeCollected || 0), 0);
  const totalExpenses = services.reduce((sum, service) => sum + service.expenses, 0);
  const profit = totalRevenue - totalExpenses;

  const monthlyRevenue = monthlyServices.reduce((sum, service) => sum + (service.cost || service.feeCollected || 0), 0);
  const monthlyExpenses = monthlyServices.reduce((sum, service) => sum + service.expenses, 0);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  const yearlyRevenue = yearlyServices.reduce((sum, service) => sum + (service.cost || service.feeCollected || 0), 0);
  const yearlyExpenses = yearlyServices.reduce((sum, service) => sum + service.expenses, 0);
  const yearlyProfit = yearlyRevenue - yearlyExpenses;

  return {
    totalServices,
    totalRevenue,
    totalExpenses,
    profit,
    monthlyStats: {
      revenue: monthlyRevenue,
      expenses: monthlyExpenses,
      profit: monthlyProfit,
    },
    yearlyStats: {
      revenue: yearlyRevenue,
      expenses: yearlyExpenses,
      profit: yearlyProfit,
    },
  };
};

export const generateId = (): string => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const saveServiceOrder = (services: ServiceRecord[]) => {
  try {
    const orderData = services.map((service, index) => ({
      id: service.id,
      order: index
    }));
    localStorage.setItem('serviceOrder', JSON.stringify(orderData));
  } catch (error) {
    console.error('Failed to save service order:', error);
  }
};

export const loadServiceOrder = (): { [key: string]: number } => {
  try {
    const orderData = localStorage.getItem('serviceOrder');
    if (orderData) {
      const parsed = JSON.parse(orderData);
      const orderMap: { [key: string]: number } = {};
      parsed.forEach((item: { id: string; order: number }) => {
        orderMap[item.id] = item.order;
      });
      return orderMap;
    }
  } catch (error) {
    console.error('Failed to load service order:', error);
  }
  return {};
};

export const applySavedOrder = (services: ServiceRecord[]): ServiceRecord[] => {
  const orderMap = loadServiceOrder();
  
  if (Object.keys(orderMap).length === 0) {
    return services;
  }
  
  return services.sort((a, b) => {
    const orderA = orderMap[a.id] ?? 999999;
    const orderB = orderMap[b.id] ?? 999999;
    return orderA - orderB;
  });
};

export const getCleanedPhoneNumberForDisplay = (rawInput: string): string => {
  if (!rawInput) return '';
  
  // Extract only digits from the raw input for phone calls
  const digits = rawInput.replace(/\D/g, '');
  
  // If we have digits, format them for Turkish numbers
  if (digits.length >= 10) {
    // Handle +90 prefix - replace with 0
    if (digits.startsWith('90') && digits.length >= 12) {
      return '0' + digits.substring(2);
    }
    
    // Ensure it starts with 0 for Turkish numbers
    if (!digits.startsWith('0') && digits.length === 10) {
      return '0' + digits;
    }
    
    return digits;
  }
  
  return digits;
};

export const formatRawPhoneNumberWithColor = (rawInput: string) => {
  if (!rawInput) return null;
  
  // Enhanced parsing for phone number formatting and coloring
  const parts = rawInput.split(/(\([^)]*\))/);
  
  return parts.map((part, index) => {
    if (part.startsWith('(') && part.endsWith(')')) {
      // Text inside parentheses - render in green
      return (
        <span key={index} className="text-green-300">
          {part}
        </span>
      );
    } else {
      // Process text outside parentheses
      const processedPart = processPhoneNumberSegment(part);
      return (
        <span key={index}>
          {processedPart}
        </span>
      );
    }
  });
};

// Helper function to process phone number segments
const processPhoneNumberSegment = (segment: string) => {
  if (!segment) return '';
  
  // Phone number patterns to detect and normalize
  const phonePatterns = [
    /(\+90\s*\d{3}\s*\d{3}\s*\d{2}\s*\d{2})/g,  // +90 534 682 22 82
    /(\+90\d{10})/g,                              // +905346822282
    /(90\d{10})/g,                                // 905346822282
    /(0\d{10})/g,                                 // 05346822282
    /(0\d{3}\s*\d{3}\s*\d{2}\s*\d{2})/g,        // 0534 682 22 82
    /(0\d{3}\s*\d{3}\s*\d{4})/g,                 // 0534 682 2282
    /(\d{11})/g                                   // 15346822282 (fallback)
  ];
  
  let processedSegment = segment;
  let hasPhoneNumber = false;
  
  // Check if segment contains a phone number pattern
  for (const pattern of phonePatterns) {
    if (pattern.test(segment)) {
      hasPhoneNumber = true;
      // Replace each phone number match with its normalized version
      processedSegment = segment.replace(pattern, (match) => {
        return formatPhoneNumberForStorage(match);
      });
      break;
    }
  }
  
  // If no phone number was found, check for any sequence of 10-11 digits
  if (!hasPhoneNumber) {
    if (/\d{10,11}/.test(segment)) {
      processedSegment = segment.replace(/\d{10,11}/g, (match) => {
        return formatPhoneNumberForStorage(match);
      });
    }
  }
  
  // Return the processed segment in blue color
  return (
    <span className="text-blue-300">
      {processedSegment}
    </span>
  );
};

export const formatPhoneNumberForStorage = (input: string): string => {
  if (!input) return '';
  
  // Remove all non-digit characters
  let cleaned = input.replace(/\D/g, '');
  
  // Handle +90 prefix - replace with 0
  if (cleaned.startsWith('90') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  // Ensure it starts with 0 for Turkish numbers
  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
};

export const extractPhoneFromText = (text: string): string => {
  if (!text) return '';
  
  // Try to find phone number patterns in the text
  const phonePatterns = [
    /(\+90\s*\d{3}\s*\d{3}\s*\d{2}\s*\d{2})/g,  // +90 534 682 22 82
    /(\+90\d{10})/g,                              // +905346822282
    /(90\d{10})/g,                                // 905346822282
    /(0\d{10})/g,                                 // 05346822282
    /(\d{11})/g                                   // 15346822282 (fallback)
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      return formatPhoneNumberForStorage(match[0]);
    }
  }
  
  // If no pattern matches, try to extract any 10-11 digit sequence
  const digits = text.replace(/\D/g, '');
  if (digits.length >= 10) {
    return formatPhoneNumberForStorage(digits);
  }
  
  return text; // Return original if no phone number detected
};

export const cleanAddressPrefix = (address: string): string => {
  if (!address) return '';
  
  // Remove patterns like "// [4]", "// [digit]" from the beginning of the address
  return address.replace(/^\/\/\s*\[\d+\]\s*/, '').trim();
};

export const cleanPrefixes = (text: string): string => {
  if (!text) return '';
  
  // Remove patterns like "// [4]", "// [digit]", "// [7]" from anywhere in the text
  // Also remove other meaningless patterns that might appear
  return text
    .replace(/\/\/\s*\[\d+\]\s*/g, '') // Remove // [digit] patterns globally
    .replace(/^\/\/\s*/g, '') // Remove // at the beginning
    .replace(/\s*\/\/\s*$/g, '') // Remove // at the end
    .trim();
};