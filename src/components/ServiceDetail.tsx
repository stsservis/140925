import React from 'react';
import { useState } from 'react';
import { ServiceRecord } from '../types';
import { formatCurrency, formatDate, cleanPrefixes, getCleanedPhoneNumberForDisplay, formatRawPhoneNumberWithColor } from '../utils/helpers.tsx';
import { XIcon, CalendarIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface ServiceDetailProps {
  service: ServiceRecord;
  onClose: () => void;
  onEdit: (service: ServiceRecord) => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onClose, onEdit }) => {
  const [showFinancials, setShowFinancials] = useState(false);
  
  const cost = service.cost || service.feeCollected || 0;
  const profit = cost - service.expenses;
  const profitShare = profit * 0.35;
  const remainingAmount = profit - profitShare;

  const handlePhoneClick = () => {
    const rawPhone = service.rawCustomerPhoneInput || service.customerPhone || service.phoneNumber || '';
    const cleanedNumber = getCleanedPhoneNumberForDisplay(rawPhone);
    window.location.href = `tel:${cleanedNumber}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'Devam Ediyor';
      case 'workshop': return 'Atölyede';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500 text-green-50 text-xs font-semibold px-2 py-1 rounded-full';
      case 'workshop': return 'bg-orange-500 text-orange-50 text-xs font-semibold px-2 py-1 rounded-full';
      case 'completed': return 'bg-green-500 text-green-50 text-xs font-semibold px-2 py-1 rounded-full';
      default: return 'bg-zinc-500 text-zinc-50 text-xs font-semibold px-2 py-1 rounded-full';
    }
  };

  const getColorName = (color: string) => {
    const colorNames: { [key: string]: string } = {
      white: 'Beyaz',
      red: 'Kırmızı',
      orange: 'Turuncu',
      yellow: 'Sarı',
      green: 'Yeşil',
      blue: 'Mavi',
      purple: 'Mor',
      pink: 'Pembe',
      gray: 'Gri',
    };
    return colorNames[color] || color;
  };

  const getColorClass = (color: string) => {
    const colorClasses: { [key: string]: string } = {
      white: 'bg-zinc-600 border-zinc-500',
      red: 'bg-red-600 border-red-500',
      orange: 'bg-orange-600 border-orange-500',
      yellow: 'bg-yellow-600 border-yellow-500',
      green: 'bg-green-600 border-green-500',
      blue: 'bg-blue-600 border-blue-500',
      purple: 'bg-purple-600 border-purple-500',
      pink: 'bg-pink-600 border-pink-500',
      gray: 'bg-gray-600 border-gray-500',
    };
    return colorClasses[color] || colorClasses.white;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 p-3 flex items-center justify-center">
      <div className="bg-zinc-900/40 backdrop-blur-lg rounded-xl shadow-lg border border-zinc-700/50 w-full md:w-[70vw] max-w-screen-md max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-zinc-900/40 backdrop-blur-md px-4 py-2.5 flex items-center justify-between flex-shrink-0 min-h-[50px] shadow-xl border-b border-zinc-700/50">
          <h2 className="text-xl font-semibold text-white truncate">Servis Detayları</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:bg-white/10 p-2 rounded-lg transition-all min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-3 py-4 space-y-3 pb-4">
            <div className="bg-zinc-900/30 backdrop-blur-md rounded-xl shadow-lg border border-zinc-700/50 p-3">
              <label className="block text-sm font-medium mb-1.5 text-zinc-300">İletişim Bilgileri</label>
              <div className="space-y-3">
                <div>
                  <button
                    onClick={handlePhoneClick}
                    className="w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring focus:ring-purple-500 bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 flex justify-start items-center min-h-[48px] hover:bg-zinc-800/70 transition-all"
                  >
                    <span className="text-base font-semibold break-all text-left overflow-wrap-anywhere">
                      {formatRawPhoneNumberWithColor(cleanPrefixes(service.rawCustomerPhoneInput || service.customerPhone || service.phoneNumber || ''))}
                    </span>
                  </button>
                </div>
                {service.phoneNumberNote && (
                  <div className="bg-zinc-800/50 px-3 py-2.5 rounded-lg border border-zinc-700/50 text-sm min-h-[40px]">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                      </svg>
                      <span className="text-zinc-300 font-medium">Telefon Notu:</span>
                    </div>
                    <p className="text-zinc-200 break-words whitespace-pre-wrap leading-snug">{cleanPrefixes(service.phoneNumberNote)}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 bg-zinc-800/50 rounded-lg py-2.5 px-3 border border-zinc-700/50 text-sm min-h-[40px] w-full">
                  <CalendarIcon className="h-5 w-5 text-zinc-400" />
                  <span className="text-zinc-100 font-medium">Tarih: {service.createdAt ? new Date(service.createdAt).toLocaleDateString('tr-TR') : formatDate(service.date || '')}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 backdrop-blur-md rounded-xl shadow-lg border border-zinc-700/50 p-3">
              <label className="block text-sm font-medium mb-1.5 text-zinc-300">Adres ve Açıklama</label>
              <div>
                <div className="flex-grow rounded-lg py-2.5 px-3 resize-none bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-sm break-words whitespace-pre-wrap leading-relaxed min-h-[70px] overflow-wrap-anywhere">
                  {(() => {
                    const address = service.address || service.description || '';
                    return cleanPrefixes(address);
                  })()}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 backdrop-blur-md rounded-xl shadow-lg border border-zinc-700/50 p-3">
              <button onClick={() => setShowFinancials(!showFinancials)} className="flex justify-between items-center w-full py-2.5 px-3 focus:outline-none cursor-pointer">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 cursor-pointer">Finansal Bilgiler</label>
                </div>
                <div className="flex items-center space-x-2">
                  {showFinancials ? (
                    <ChevronUpIcon className="h-5 w-5 text-zinc-400 transform transition-transform" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-zinc-400 transform transition-transform" />
                  )}
                </div>
              </button>
              
              {showFinancials && (
                <div className="mt-1.5 space-y-1.5">
                  <div className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50 space-y-1 text-xs text-zinc-100 shadow-md">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Gelir:</span>
                      <span className="font-medium text-green-300 break-words">{formatCurrency(cost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Gider:</span>
                      <span className="font-medium text-red-300 break-words">{formatCurrency(service.expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Net Kâr:</span>
                      <span className={`font-medium break-words ${profit >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                        {formatCurrency(profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Kâr Payı (%35):</span>
                      <span className="font-medium text-orange-300 break-words">{formatCurrency(profitShare)}</span>
                    </div>
                    {service.deposit && service.deposit > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Kapora:</span>
                        <span className="font-medium text-yellow-300 break-words">{formatCurrency(service.deposit)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-zinc-700 pt-1">
                      <span className="text-zinc-300">Kalan Tutar:</span>
                      <span className={`font-bold break-words ${remainingAmount >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(service.partsChanged || service.missingParts) && (
              <div className="bg-zinc-900/30 backdrop-blur-md rounded-xl shadow-lg border border-zinc-700/50 p-3">
                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Ek Bilgiler</label>
                {service.partsChanged && (
                  <div className="mb-2">
                    <p className="text-sm text-zinc-300 mb-2 font-medium">Değiştirilen Parçalar:</p>
                    <p className="text-sm text-zinc-200 bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50 break-words whitespace-pre-wrap">
                      {service.partsChanged}
                    </p>
                  </div>
                )}
                {service.missingParts && (
                  <div>
                    <p className="text-sm text-zinc-300 mb-2 font-medium">Eksik Parçalar:</p>
                    <p className="text-sm text-zinc-200 bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50 break-words whitespace-pre-wrap">
                      {service.missingParts}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 bg-zinc-900/40 backdrop-blur-md border-t border-zinc-700/50 p-4 safe-area-inset-bottom shadow-xl rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onEdit(service)}
              className="detail-button-primary"
            >
              Düzenle
            </button>
            <button
              onClick={onClose}
              className="detail-button-secondary"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;