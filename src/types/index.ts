export interface ServiceRecord {
  id: string;
  customerPhone: string;
  address: string;
  color?: string;
  cost: number;
  expenses: number;
  deposit?: number;
  status: 'ongoing' | 'completed' | 'workshop';
  createdAt: string;
  updatedAt: string;
  rawCustomerPhoneInput?: string;
  order?: number;
  date?: string;
  phoneNumber?: string;
  feeCollected?: number;
  quotedPrice?: number;
  description?: string;
  partsChanged?: string;
  missingParts?: string;
  phoneNumberNote?: string;
}

export interface DashboardStats {
  totalServices: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  monthlyStats: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  yearlyStats: {
    revenue: number;
    expenses: number;
    profit: number;
  };
}