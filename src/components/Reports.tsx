import React, { useState } from 'react';
import { ServiceRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers.tsx';
import { ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import { saveServiceOrder } from '../utils/helpers';

interface ReportsProps {
  services: ServiceRecord[];
  onViewService: (service: ServiceRecord) => void;
  onReorderServices?: (reorderedServices: ServiceRecord[]) => void;
}

export default function Reports({ services, onViewService, onReorderServices }: ReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearlyStats, setShowYearlyStats] = useState(false);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false);
  const [showServicesList, setShowServicesList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'address' | 'phone' | 'revenue' | 'expenses' | 'profit' | 'remaining' | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Filter services by selected month and year
  let filteredServices = services.filter(service => {
    const serviceDate = service.createdAt ? new Date(service.createdAt) : new Date(service.date || '');
    return service.status === 'completed' &&
           serviceDate.getMonth() + 1 === selectedMonth && 
           serviceDate.getFullYear() === selectedYear;
  });

  // Apply search and date filters
  if (searchTerm || dateFilter) {
    filteredServices = filteredServices.filter(service => {
      const phone = service.customerPhone || service.phoneNumber || '';
      const address = service.address || service.description || '';
      const serviceDate = service.createdAt ? new Date(service.createdAt) : new Date(service.date || '');
      
      const matchesSearch = !searchTerm || 
        phone.includes(searchTerm) ||
        address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || 
        serviceDate.toISOString().includes(dateFilter) ||
        serviceDate.toLocaleDateString('tr-TR').includes(dateFilter) ||
        serviceDate.getFullYear().toString().includes(dateFilter) ||
        (serviceDate.getMonth() + 1).toString().padStart(2, '0').includes(dateFilter) ||
        serviceDate.getDate().toString().padStart(2, '0').includes(dateFilter);
      
      return matchesSearch && matchesDate;
    });
  }

  // Apply sorting
  if (sortConfig.key) {
    filteredServices = [...filteredServices].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;
      
      switch (sortConfig.key) {
        case 'date':
          const aDate = a.createdAt ? new Date(a.createdAt) : new Date(a.date || '');
          const bDate = b.createdAt ? new Date(b.createdAt) : new Date(b.date || '');
          aValue = aDate.getTime();
          bValue = bDate.getTime();
          break;
        case 'address':
          aValue = a.address || a.description || '';
          bValue = b.address || b.description || '';
          break;
        case 'phone':
          aValue = a.customerPhone || a.phoneNumber || '';
          bValue = b.customerPhone || b.phoneNumber || '';
          break;
        case 'revenue':
          aValue = a.cost || a.feeCollected || 0;
          bValue = b.cost || b.feeCollected || 0;
          break;
        case 'expenses':
          aValue = a.expenses;
          bValue = b.expenses;
          break;
        case 'profit':
          aValue = (a.cost || a.feeCollected || 0) - a.expenses;      // Net Kâr
          bValue = (b.cost || b.feeCollected || 0) - b.expenses;      // Net Kâr
          break;
        case 'remaining':
          const aNetProfit = (a.cost || a.feeCollected || 0) - a.expenses;  // Net Kâr
          const bNetProfit = (b.cost || b.feeCollected || 0) - b.expenses;  // Net Kâr
          const aProfitShare = aNetProfit * 0.3;                            // Kâr Payı
          const bProfitShare = bNetProfit * 0.3;                            // Kâr Payı
          aValue = aNetProfit - aProfitShare;                               // Kalan
          bValue = bNetProfit - bProfitShare;                               // Kalan
          break;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue, 'tr')
          : bValue.localeCompare(aValue, 'tr');
      }
      
      return sortConfig.direction === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }

  // Filter yearly services
  const yearlyServices = services.filter(service => {
    const serviceDate = service.createdAt ? new Date(service.createdAt) : new Date(service.date || '');
    return service.status === 'completed' &&
           serviceDate.getFullYear() === selectedYear;
  });

  // Calculate monthly financial data
  const monthlyRevenue = filteredServices.reduce((sum, service) => sum + (service.cost || service.feeCollected || 0), 0);
  const monthlyExpenses = filteredServices.reduce((sum, service) => sum + service.expenses, 0);
  const monthlyNetProfit = monthlyRevenue - monthlyExpenses;  // Gelir - Gider = Net Kâr
  const monthlyProfitShare = monthlyNetProfit * 0.35;         // Net Kâr × %35 = Kâr Payı
  const monthlyRemaining = monthlyNetProfit - monthlyProfitShare; // Net Kâr - Kâr Payı = Kalan

  // Calculate yearly financial data
  const yearlyRevenue = yearlyServices.reduce((sum, service) => sum + (service.cost || service.feeCollected || 0), 0);
  const yearlyExpenses = yearlyServices.reduce((sum, service) => sum + service.expenses, 0);
  const yearlyNetProfit = yearlyRevenue - yearlyExpenses;     // Gelir - Gider = Net Kâr
  const yearlyProfitShare = yearlyNetProfit * 0.35;          // Net Kâr × %35 = Kâr Payı
  const yearlyRemaining = yearlyNetProfit - yearlyProfitShare; // Net Kâr - Kâr Payı = Kalan

  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' }
  ];

  const years = [2023, 2024, 2025, 2026];

  const handleSort = (key: 'date' | 'address' | 'phone' | 'revenue' | 'expenses' | 'profit' | 'remaining') => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Create a copy of the filtered services for reordering
    const reorderedServices = [...filteredServices];
    const [draggedService] = reorderedServices.splice(draggedIndex, 1);
    reorderedServices.splice(dropIndex, 0, draggedService);

    // Create a new services array with the reordered filtered services
    const serviceMap = new Map(reorderedServices.map((service, index) => [service.id, { ...service, order: index }]));
    
    const updatedServices = services.map(service => {
      if (serviceMap.has(service.id)) {
        return serviceMap.get(service.id)!;
      }
      return service;
    });

    // Sort by the new order for filtered services, keep others in original position
    const finalServices = updatedServices.sort((a, b) => {
      const aInFiltered = serviceMap.has(a.id);
      const bInFiltered = serviceMap.has(b.id);
      
      if (aInFiltered && bInFiltered) {
        return (a.order || 0) - (b.order || 0);
      }
      if (aInFiltered && !bInFiltered) return -1;
      if (!aInFiltered && bInFiltered) return 1;
      return 0;
    });

    if (onReorderServices) {
      onReorderServices(finalServices);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 p-3">
        <h1 className="text-xs font-bold text-zinc-100 mb-1.5">Rapor Dönemi</h1>
        
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Ay</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[30px] bg-white/5 backdrop-blur-md text-zinc-100 transition-all duration-300 hover:bg-white/10 focus:bg-white/15"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Yıl</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[30px] bg-white/5 backdrop-blur-md text-zinc-100 transition-all duration-300 hover:bg-white/10 focus:bg-white/15"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Yearly Summary - Collapsible */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 p-3">
        <div className="flex items-center justify-between mb-1.5 text-zinc-100">
          <h2 className="text-xs font-semibold text-zinc-100">
            <span className="break-words">Aylık Özet ({months.find(m => m.value === selectedMonth)?.label} {selectedYear})</span>
          </h2>
          <button
            onClick={() => setShowMonthlyDetails(!showMonthlyDetails)}
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {showMonthlyDetails ? (
              <ChevronUpIcon className="w-3 h-3" />
            ) : (
              <ChevronDownIcon className="w-3 h-3" />
            )}
          </button>
        </div>
        
        {showMonthlyDetails && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5 text-zinc-100">
              <div className="bg-green-500/10 backdrop-blur-md rounded-lg p-2 border border-green-400/20 text-center min-h-[40px] flex flex-col justify-center shadow-md">
                <div className="text-xs text-zinc-400">Gelir</div>
                <div className="font-bold text-green-300 text-xs break-words">{formatCurrency(monthlyRevenue)}</div>
              </div>
              <div className="bg-red-500/10 backdrop-blur-md rounded-lg p-2 border border-red-400/20 text-center min-h-[40px] flex flex-col justify-center shadow-md">
                <div className="text-xs text-zinc-400">Gider</div>
                <div className="font-bold text-red-300 text-xs break-words">{formatCurrency(monthlyExpenses)}</div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 backdrop-blur-md rounded-lg p-2 border border-blue-400/20 space-y-1 text-xs text-zinc-100 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Net Kâr:</span>
                <span className={`font-medium break-words ${monthlyNetProfit >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                  {formatCurrency(monthlyNetProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Kâr Payı (%35):</span>
                <span className="font-medium text-orange-300 break-words">{formatCurrency(monthlyProfitShare)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-700 pt-1">
                <span className="text-zinc-300">Kalan Tutar:</span>
                <span className={`font-bold break-words ${monthlyRemaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(monthlyRemaining)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowServicesList(!showServicesList)}
              className="w-full bg-blue-500/20 backdrop-blur-md text-white py-2 px-3 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-xs font-medium border border-blue-400/20 hover:border-blue-400/30 shadow-md"
            >
              {showServicesList ? 'Servis Listesini Gizle' : 'Servis Listesini Göster'}
            </button>
            
            <div className="text-center text-xs text-zinc-400 bg-white/5 backdrop-blur-md rounded-lg p-2 border border-white/10 shadow-md">
              Toplam {filteredServices.length} tamamlanan servis
            </div>
          </div>
        )}
      </div>

      {/* Yearly Summary */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-semibold text-zinc-100">
            <span className="break-words">Yıllık Özet ({selectedYear})</span>
          </h2>
          <button
            onClick={() => setShowYearlyStats(!showYearlyStats)}
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {showYearlyStats ? (
              <ChevronUpIcon className="w-3 h-3" />
            ) : (
              <ChevronDownIcon className="w-3 h-3" />
            )}
          </button>
        </div>
        
        {showYearlyStats && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5 text-zinc-100">
              <div className="bg-green-500/10 backdrop-blur-md rounded-lg p-2 border border-green-400/20 text-center min-h-[40px] flex flex-col justify-center shadow-md">
                <div className="text-xs text-zinc-400">Gelir</div>
                <div className="font-bold text-green-300 text-xs break-words">{formatCurrency(yearlyRevenue)}</div>
              </div>
              <div className="bg-red-500/10 backdrop-blur-md rounded-lg p-2 border border-red-400/20 text-center min-h-[40px] flex flex-col justify-center shadow-md">
                <div className="text-xs text-zinc-400">Gider</div>
                <div className="font-bold text-red-300 text-xs break-words">{formatCurrency(yearlyExpenses)}</div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 backdrop-blur-md rounded-lg p-2 border border-blue-400/20 space-y-1 text-xs text-zinc-100 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Net Kâr:</span>
                <span className={`font-medium break-words ${yearlyNetProfit >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                  {formatCurrency(yearlyNetProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Kâr Payı (%35):</span>
                <span className="font-medium text-orange-300 break-words">{formatCurrency(yearlyProfitShare)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-700 pt-1">
                <span className="text-zinc-300">Kalan Tutar:</span>
                <span className={`font-bold break-words ${yearlyRemaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(yearlyRemaining)}
                </span>
              </div>
            </div>
            
            <div className="text-center text-xs text-zinc-400 bg-white/5 backdrop-blur-md rounded-lg p-2 border border-white/10 shadow-md">
              Toplam {yearlyServices.length} tamamlanan servis
            </div>
          </div>
        )}
      </div>

      {/* Servis Listesi - Horizontal Scroll Table */}
      {showServicesList && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-zinc-100">
              {months.find(m => m.value === selectedMonth)?.label} {selectedYear} Servisleri
            </h3>
            <span className="text-xs text-gray-500">Toplam: {filteredServices.length} servis</span>
          </div>
          
          {/* Search Filter */}
          <div className="mb-2">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-3 w-3 text-zinc-400 z-10" />
              <input
                type="text"
                placeholder="Akıllı arama: tarih, telefon, adres veya anahtar kelime..."
                className="w-full pl-8 pr-2 py-1.5 text-xs min-h-[28px] bg-transparent text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-white/10 focus:bg-white/15 glass-input-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Horizontal Scroll Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Table Header */} // [3]
              <div className="grid grid-cols-8 gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg text-xs font-semibold text-gray-800 mb-2 shadow-sm border border-blue-100">
                <button
                  onClick={() => handleSort('date')}
                  className="hover:bg-white/60 p-2 rounded-md text-left transition-all duration-200 hover:shadow-sm"
                >
                  Tarih
                </button>
                <button
                  onClick={() => handleSort('phone')}
                  className="hover:bg-white/60 p-2 rounded-md text-left transition-all duration-200 hover:shadow-sm"
                >
                  Telefon
                </button>
                <button
                  onClick={() => handleSort('address')}
                  className="hover:bg-white/60 p-2 rounded-md text-left transition-all duration-200 hover:shadow-sm"
                >
                  Adres
                </button>
                <button
                  onClick={() => handleSort('revenue')}
                  className="hover:bg-white/60 p-2 rounded-md text-right transition-all duration-200 hover:shadow-sm"
                >
                  Gelir
                </button>
                <button
                  onClick={() => handleSort('expenses')}
                  className="hover:bg-white/60 p-2 rounded-md text-right transition-all duration-200 hover:shadow-sm"
                >
                  Gider
                </button>
                <button
                  onClick={() => handleSort('profit')}
                  className="hover:bg-white/60 p-2 rounded-md text-right transition-all duration-200 hover:shadow-sm"
                >
                  Net Kâr
                </button>
                <button
                  className="hover:bg-white/60 p-2 rounded-md text-right transition-all duration-200 hover:shadow-sm cursor-default"
                >
                  Kâr Payı
                </button>
                <button
                  onClick={() => handleSort('remaining')}
                  className="hover:bg-white/60 p-2 rounded-md text-right transition-all duration-200 hover:shadow-sm"
                >
                  Kalan
                </button>
              </div>
              
              {/* Table Body */}
              <div className="space-y-1">
                {filteredServices.map((service) => {
                  const cost = service.cost || service.feeCollected || 0;
                  const profit = cost - service.expenses;
                  const profitShare = profit * 0.35;
                  const remaining = profit - profitShare; // Kalan = Net Kâr - Kâr Payı
                  const serviceDate = service.createdAt ? new Date(service.createdAt) : new Date(service.date || '');
                  
                  return (
                    <div
                      key={service.id} // [4]
                      onClick={() => onViewService(service)} // [5]
                      className="grid grid-cols-8 gap-2 p-2 bg-white/5 backdrop-blur-md hover:bg-white/10 rounded-lg text-xs cursor-pointer transition-all duration-300 border border-white/5 hover:border-white/10 shadow-sm hover:shadow-md"
                    >
                      <div className="text-zinc-300">
                        {serviceDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                      </div>
                      <div className="text-blue-300 font-medium break-all">
                        {service.customerPhone || service.phoneNumber}
                      </div>
                      <div className="text-zinc-300 break-words">
                        {service.address || service.description}
                      </div>
                      <div className="text-green-300 font-medium text-right">
                        {formatCurrency(cost)}
                      </div>
                      <div className="text-red-300 font-medium text-right">
                        {formatCurrency(service.expenses)}
                      </div>
                      <div className={`font-medium text-right ${profit >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                        {formatCurrency(profit)}
                      </div>
                      <div className="text-orange-300 font-medium text-right">
                        {formatCurrency(profitShare)}
                      </div>
                      <div className={`font-bold text-right ${remaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {formatCurrency(remaining)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredServices.length === 0 && ( // [6]
                <div className="text-center py-4 text-gray-500 text-xs">
                  {searchTerm || dateFilter ? 'Filtreye uygun servis bulunamadı' : 'Bu dönemde tamamlanan servis bulunmuyor'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}