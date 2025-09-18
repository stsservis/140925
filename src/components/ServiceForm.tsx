import React, { useState, useEffect } from 'react';
import { ServiceRecord } from '../types';
import { generateId, formatCurrency, formatPhoneNumberForStorage, extractPhoneFromText, cleanPrefixes } from '../utils/helpers.tsx';

const STS_TEMP_SERVICE_FORM_DATA = 'sts_temp_service_form_data';

interface ServiceFormProps {
  service?: ServiceRecord;
  onSave: (service: ServiceRecord) => void;
  onCancel: () => void;
}

const colorOptions = [
  { value: 'white', label: 'Beyaz', class: 'bg-zinc-600 border-zinc-500', bgClass: 'bg-zinc-600', borderClass: 'border-l-zinc-500' },
  { value: 'red', label: 'Kırmızı', class: 'bg-red-600 border-red-500', bgClass: 'bg-red-600', borderClass: 'border-l-red-500' },
  { value: 'orange', label: 'Turuncu', class: 'bg-orange-600 border-orange-500', bgClass: 'bg-orange-600', borderClass: 'border-l-orange-500' },
  { value: 'yellow', label: 'Sarı', class: 'bg-yellow-600 border-yellow-500', bgClass: 'bg-yellow-600', borderClass: 'border-l-yellow-500' },
  { value: 'green', label: 'Yeşil', class: 'bg-green-600 border-green-500', bgClass: 'bg-green-600', borderClass: 'border-l-green-500' },
  { value: 'blue', label: 'Mavi', class: 'bg-blue-600 border-blue-500', bgClass: 'bg-blue-600', borderClass: 'border-l-blue-500' },
  { value: 'purple', label: 'Mor', class: 'bg-purple-600 border-purple-500', bgClass: 'bg-purple-600', borderClass: 'border-l-purple-500' },
  { value: 'pink', label: 'Pembe', class: 'bg-pink-600 border-pink-500', bgClass: 'bg-pink-600', borderClass: 'border-l-pink-500' },
  { value: 'gray', label: 'Gri', class: 'bg-gray-600 border-gray-500', bgClass: 'bg-gray-600', borderClass: 'border-l-gray-500' },
];

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSave,
  onCancel,
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<ServiceRecord>({
    id: '',
    customerPhone: '',
    rawCustomerPhoneInput: '',
    address: '',
    color: 'white',
    cost: 0,
    expenses: 0,
    deposit: 0,
    status: 'ongoing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phoneNumberNote: '',
  });
  
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');

  useEffect(() => {
    if (service) {
      const rawPhone = service.rawCustomerPhoneInput || service.customerPhone || service.phoneNumber || '';
      const originalPhone = cleanPrefixes(rawPhone);
      setFormData({
        ...service,
        // Migrate legacy fields if they exist
        customerPhone: formatPhoneNumberForStorage(originalPhone),
        rawCustomerPhoneInput: rawPhone,
        address: service.address || service.description || '',
        cost: service.cost || service.feeCollected || 0,
        phoneNumberNote: service.phoneNumberNote || '',
        deposit: service.deposit || 0,
        updatedAt: new Date().toISOString(),
      });
      setDisplayPhoneNumber(originalPhone);
    } else {
      // Check for temporary form data when creating a new service
      try {
        const tempData = localStorage.getItem(STS_TEMP_SERVICE_FORM_DATA);
        if (tempData) {
          const parsedData = JSON.parse(tempData);
          const rawTempPhone = parsedData.rawCustomerPhoneInput || parsedData.displayPhoneNumber || parsedData.customerPhone || '';
          const tempPhone = cleanPrefixes(rawTempPhone);
          setFormData({
            ...parsedData,
            customerPhone: formatPhoneNumberForStorage(tempPhone),
            rawCustomerPhoneInput: rawTempPhone,
            address: cleanPrefixes(parsedData.address || ''),
            phoneNumberNote: parsedData.phoneNumberNote || '',
            deposit: parsedData.deposit || 0,
            updatedAt: new Date().toISOString(),
          });
          setDisplayPhoneNumber(tempPhone);
        } else {
          // Always reset form completely when no service is provided (new service)
          const newId = generateId();
          setFormData({
            id: newId,
            customerPhone: '',
            rawCustomerPhoneInput: '',
            address: '',
            color: 'white',
            cost: 0,
            expenses: 0,
            status: 'ongoing',
            phoneNumberNote: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setDisplayPhoneNumber('');
        }
      } catch (error) {
        console.error('Failed to load temporary form data:', error);
        // Fallback to empty form
        const newId = generateId();
        setFormData({
          id: newId,
          customerPhone: '',
          rawCustomerPhoneInput: '',
          address: '',
          color: 'white',
          cost: 0,
          expenses: 0,
          deposit: 0,
          status: 'ongoing',
          phoneNumberNote: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setDisplayPhoneNumber('');
      }
    }
  }, [service]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    let updatedFormData = { ...formData };
    
    // Format phone number if it's the customerPhone field
    if (name === 'customerPhone') {
      setDisplayPhoneNumber(value); // Store raw input for display
      const extractedPhone = extractPhoneFromText(value);
      updatedFormData.customerPhone = extractedPhone;
      updatedFormData.rawCustomerPhoneInput = value; // Store raw input
      updatedFormData.updatedAt = new Date().toISOString();
    } else {
      updatedFormData[name] = name === 'cost' || name === 'expenses'
        ? parseFloat(processedValue) || 0
        : name === 'deposit'
        ? processedValue === '' ? undefined : parseFloat(processedValue) || 0
        : processedValue;
      updatedFormData.updatedAt = new Date().toISOString();
    }
    
    setFormData(updatedFormData);
    
    // Save form data to localStorage for persistence (only for new services)
    if (!service) {
      try {
        const dataToSave = {
          ...updatedFormData,
          rawCustomerPhoneInput: name === 'customerPhone' ? value : updatedFormData.rawCustomerPhoneInput,
          displayPhoneNumber: name === 'customerPhone' ? value : displayPhoneNumber,
        };
        localStorage.setItem(STS_TEMP_SERVICE_FORM_DATA, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save temporary form data:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    
    // Clear temporary form data after successful save
    try {
      localStorage.removeItem(STS_TEMP_SERVICE_FORM_DATA);
    } catch (error) {
      console.error('Failed to clear temporary form data:', error);
    }
  };

  const handleCancel = () => {
    // Clear temporary form data when canceling
    try {
      localStorage.removeItem(STS_TEMP_SERVICE_FORM_DATA);
    } catch (error) {
      console.error('Failed to clear temporary form data:', error);
    }
    onCancel();
  };

  const profit = formData.cost - formData.expenses;
  const profitShare = profit * 0.35;
  const remainingAmount = profit - profitShare;

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-zinc-900/30 backdrop-blur-lg rounded-xl shadow-lg border border-zinc-700/50 overflow-hidden max-w-full">
        {/* Header */}
        <div className="bg-zinc-900/40 backdrop-blur-md px-4 py-3 border-b border-zinc-700/50 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100 truncate shimmer-effect">
              Servis Kaydını Düzenle
            </h2>
            <button
              onClick={handleCancel}
              className="text-zinc-400 hover:bg-white/10 p-1 rounded-md transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-16">
          {/* Description - Moved to top */}
          <div>
            <label htmlFor="address" className="block text-xs font-medium text-zinc-300 mb-0.5">
              Adres *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              required // [1]
              className="w-full px-2.5 py-2 border border-white/10 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs resize-none min-h-[60px] bg-zinc-800/50 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-800/60 focus:bg-zinc-800/70"
              placeholder="Müşteri adresi..."
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="customerPhone" className="block text-xs font-medium text-zinc-300 mb-0.5">
              Telefon Numarası *
            </label>
            <input
              type="text"
              id="customerPhone"
              name="customerPhone"
              value={displayPhoneNumber}
              onChange={handleChange} // [2]
              required // [3]
              className="w-full px-2.5 py-2 border border-white/10 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[36px] bg-zinc-800/50 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-800/60 focus:bg-zinc-800/70"
              placeholder="05XX XXX XX XX veya +90 5XX XXX XX XX (karakter ve sembol kullanabilirsiniz)"
            />
          </div>

          {/* Service Date - Moved after phone number */}
          <div>
            <label htmlFor="serviceDate" className="block text-xs font-medium text-zinc-300 mb-0.5">
              Servis Tarihi
            </label>
            <input
              type="date"
              id="serviceDate"
              name="serviceDate"
              value={formData.createdAt ? formData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const dateTime = new Date(selectedDate + 'T' + new Date().toTimeString().split(' ')[0]).toISOString();
                setFormData(prev => ({
                  ...prev,
                  createdAt: dateTime,
                  updatedAt: new Date().toISOString(),
                }));
              }}
              className="w-full px-2.5 py-2 border border-white/10 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[36px] bg-zinc-800/50 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-800/60 focus:bg-zinc-800/70"
            />
          </div>

          {/* Status, Color */}
          <div className="space-y-2">
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-zinc-300 mb-0.5">
                Durum
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required // [4]
                className="w-full px-2.5 py-2 border border-white/10 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[36px] bg-zinc-800/50 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-800/60 focus:bg-zinc-800/70"
              >
                <option value="ongoing">Devam Edenler</option>
                <option value="workshop">Atölyede</option>
                <option value="completed">Tamamlanan</option>
              </select>
            </div>

            <div>
              <label htmlFor="color" className="block text-xs font-medium text-zinc-300 mb-0.5">
                Renk
              </label>
              <select
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-2.5 py-2 border border-zinc-600 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[36px] bg-zinc-700 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-600 focus:bg-zinc-600"
              >
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value}>{color.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-zinc-900/30 backdrop-blur-md rounded-xl p-3 border border-zinc-700/50 shadow-lg">
            <h3 className="text-xs font-medium text-zinc-100 mb-2">Finansal Bilgiler</h3>
            
            <div className="space-y-2 mb-2">
              <div>
                <label htmlFor="cost" className="block text-xs font-medium text-zinc-300 mb-0.5">
                  Alınan Ücret (TL)
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost || ''}
                  onChange={handleChange}
                  min="0" // [5]
                  step="0.01" // [6]
                  className="w-full px-2.5 py-2 border border-white/10 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[36px] bg-zinc-800/50 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-800/60 focus:bg-zinc-800/70"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="expenses" className="block text-xs font-medium text-zinc-300 mb-0.5">
                  Yapılan Gider (TL)
                </label>
                <input
                  type="number"
                  id="expenses"
                  name="expenses"
                  value={formData.expenses || ''}
                  onChange={handleChange}
                  min="0" // [7]
                  step="0.01" // [8]
                  className="w-full px-2.5 py-2 border border-white/10 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[36px] bg-zinc-800/50 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-800/60 focus:bg-zinc-800/70"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="deposit" className="block text-xs font-medium text-orange-300 mb-0.5">
                  Kapora (TL)
                </label>
                <input
                  type="number"
                  id="deposit"
                  name="deposit"
                  value={formData.deposit || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-2.5 py-2 border border-white/10 rounded-md focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 text-xs min-h-[36px] bg-zinc-800/50 backdrop-blur-md text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-zinc-800/60 focus:bg-zinc-800/70"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Profit Calculations */}
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-xl p-3 space-y-1.5 border border-zinc-700/50 shadow-lg">
              <h4 className="font-medium text-zinc-100 text-xs">Kâr Hesaplaması</h4>
              
              <div className="space-y-2 text-xs text-zinc-100">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Alınan Ücret:</span>
                  <span className="font-medium text-green-300 break-words">{formatCurrency(formData.cost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Yapılan Gider:</span>
                  <span className="font-medium text-red-300 break-words">{formatCurrency(formData.expenses)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-700 pt-1.5">
                  <span className="text-zinc-300">Net Kâr:</span>
                  <span className={`font-medium break-words ${profit >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Kar Payı (%35):</span>
                  <span className="font-medium text-orange-300 break-words">{formatCurrency(profitShare)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-1.5">
                  <span className="text-zinc-300">Kalan Tutar:</span>
                  <span className={`font-bold break-words ${remainingAmount >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-1.5 pt-1.5">
            <button
              type="submit"
              className="flex-1 bg-blue-500/20 backdrop-blur-md text-white py-2.5 px-3 rounded-md hover:bg-blue-500/30 transition-colors font-medium text-xs min-h-[40px] flex items-center justify-center border border-blue-400/20 shadow-md"
            >
              Güncelle
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancel();
              }}
              className="px-3 py-2.5 border border-zinc-700/50 rounded-md text-zinc-300 hover:bg-zinc-800/30 transition-colors font-medium text-xs min-h-[40px] flex items-center justify-center backdrop-blur-md shadow-md"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;