import React, { useState, useRef, useEffect } from 'react';
import { 
  SearchIcon,
  ShareIcon,
  EditIcon,
  TrashIcon,
  XIcon
} from 'lucide-react';
import { ServiceRecord } from '../types';
import { getCleanedPhoneNumberForDisplay, formatRawPhoneNumberWithColor, cleanAddressPrefix, cleanPrefixes } from '../utils/helpers.tsx';

interface ServiceListViewProps {
  services: ServiceRecord[];
  statusFilter: 'all' | 'ongoing' | 'workshop' | 'completed';
  onEditService: (service: ServiceRecord) => void;
  onDeleteService: (id: string) => void;
  onViewService: (service: ServiceRecord) => void;
  onReorderServices?: (reorderedServices: ServiceRecord[]) => void;
  onBackToAll: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

const getServiceCardBackgroundColorClass = (color: string) => {
  // All cards now use the same neutral background regardless of color
  return 'bg-zinc-900/20';
};

const getTextColorClass = (color: string) => {
  const colorMap: { [key: string]: string } = {
    white: 'text-zinc-100',
    red: 'text-red-300',
    orange: 'text-orange-300',
    yellow: 'text-yellow-200',
    green: 'text-green-300',
    blue: 'text-blue-300',
    purple: 'text-purple-300',
    pink: 'text-pink-300',
    gray: 'text-gray-400',
  };
  return colorMap[color] || colorMap.white;
};

const ServiceListView: React.FC<ServiceListViewProps> = ({ 
  services,
  statusFilter,
  onEditService,
  onDeleteService,
  onViewService,
  onReorderServices,
  onBackToAll,
  scrollContainerRef
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [shareModalService, setShareModalService] = useState<ServiceRecord | null>(null);
  
  // Auto-scroll state
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
  // Auto-scroll functions
  const startAutoScroll = (speed: number) => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
    
    if (speed !== 0 && scrollContainerRef?.current) {
      autoScrollIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += speed;
        }
      }, 16); // ~60fps
    }
    
    setAutoScrollSpeed(speed);
  };

  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    setAutoScrollSpeed(0);
  };

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, []);

  const filteredServices = services.filter(service => {
    const phone = service.customerPhone || service.phoneNumber || '';
    const address = service.address || service.description || '';
    const serviceDate = service.createdAt ? new Date(service.createdAt) : new Date(service.date || '');
    
    // Akıllı arama - tek alanda tüm alanları ara
    const matchesSearch = !searchTerm || 
      phone.includes(searchTerm) ||
      address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDate.toISOString().includes(searchTerm) ||
      serviceDate.toLocaleDateString('tr-TR').includes(searchTerm) ||
      serviceDate.getFullYear().toString().includes(searchTerm) ||
      (serviceDate.getMonth() + 1).toString().padStart(2, '0').includes(searchTerm) ||
      serviceDate.getDate().toString().padStart(2, '0').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const servicesToShow = statusFilter === 'all' ? [] : filteredServices;

  const getStatusTitle = () => {
    switch (statusFilter) {
      case 'ongoing': return 'Devam Eden Servisler';
      case 'workshop': return 'Atölyedeki Servisler';
      case 'completed': return 'Tamamlanan Servisler';
      default: return 'Servis Listesi';
    }
  };

  const handlePhoneClick = (phoneNumber: string) => {
    const cleanedNumber = getCleanedPhoneNumberForDisplay(phoneNumber);
    window.location.href = `tel:${cleanedNumber}`;
  };

  const handleShareService = (service: ServiceRecord) => {
    const address = service.address || service.description || 'N/A';
    
    if (navigator.share) {
      navigator.share({
        title: 'Servis Adresi',
        text: address,
      }).catch((error) => {
        console.log('Paylaşım iptal edildi:', error);
      });
    } else {
      setShareModalService(service);
    }
  };

  const handleShareToWhatsApp = (service: ServiceRecord) => {
    const address = service.address || service.description || 'N/A';
    const phone = service.customerPhone || service.phoneNumber || '';
    const text = encodeURIComponent(`${address}\nTelefon: ${phone}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    setShareModalService(null);
  };

  const handleCopyToClipboard = async (service: ServiceRecord) => {
    const address = service.address || service.description || 'N/A';
    const phone = service.customerPhone || service.phoneNumber || '';
    const text = `${address}\nTelefon: ${phone}`;
    
    try {
      await navigator.clipboard.writeText(text);
      alert('Servis bilgileri panoya kopyalandı!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Servis bilgileri panoya kopyalandı!');
    }
    setShareModalService(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Auto-scroll logic
    if (scrollContainerRef?.current && draggedIndex !== null) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const mouseY = e.clientY;
      
      // Define scroll zones (top and bottom 100px of the container)
      const scrollZoneSize = 100;
      const topZone = containerRect.top + scrollZoneSize;
      const bottomZone = containerRect.bottom - scrollZoneSize;
      
      let scrollSpeed = 0;
      
      if (mouseY < topZone) {
        // Mouse is in top scroll zone - scroll up
        const distanceFromEdge = mouseY - containerRect.top;
        const normalizedDistance = Math.max(0, Math.min(1, distanceFromEdge / scrollZoneSize));
        // Closer to edge = faster scroll (inverted for top)
        scrollSpeed = -((1 - normalizedDistance) * 20); // 0 to -20 pixels per frame
      } else if (mouseY > bottomZone) {
        // Mouse is in bottom scroll zone - scroll down
        const distanceFromEdge = containerRect.bottom - mouseY;
        const normalizedDistance = Math.max(0, Math.min(1, distanceFromEdge / scrollZoneSize));
        // Closer to edge = faster scroll (inverted for bottom)
        scrollSpeed = (1 - normalizedDistance) * 10; // 0 to 10 pixels per frame
      }
      
      if (scrollSpeed !== autoScrollSpeed) {
        if (scrollSpeed === 0) {
          stopAutoScroll();
        } else {
          startAutoScroll(scrollSpeed);
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    // Stop auto-scroll
    stopAutoScroll();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const reorderedServices = [...servicesToShow];
    const [draggedService] = reorderedServices.splice(draggedIndex, 1);
    reorderedServices.splice(dropIndex, 0, draggedService);

    const serviceMap = new Map(reorderedServices.map((service, index) => [service.id, { ...service, order: index }]));
    
    const updatedServices = services.map(service => {
      if (serviceMap.has(service.id)) {
        return serviceMap.get(service.id)!;
      }
      return service;
    });

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
    // Stop auto-scroll
    stopAutoScroll();
    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col">
      <div className="pt-0 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 min-w-0">
          </div>
          <span className="text-xs text-zinc-400 whitespace-nowrap">{servicesToShow.length}</span>
        </div>
        
        {statusFilter !== 'all' && (
          <div className="space-y-1.5">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 z-10" />
              <input
                type="text"
                placeholder="Akıllı arama: tarih, telefon, adres..."
                className="w-full pl-8 pr-2.5 py-2 text-xs min-h-[36px] bg-transparent text-zinc-100 placeholder-zinc-400 transition-all duration-300 hover:bg-white/10 focus:bg-white/15 glass-input-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-0 pb-4">
        {servicesToShow.map((service, index) => {
          const isDragging = draggedIndex === index;
          
          return (
            <div 
              key={service.id}
              draggable={servicesToShow.length > 1}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`list-item-3d-effect ${getServiceCardBackgroundColorClass(service.color || 'white')} border border-white/10 px-3 py-1.5 mb-1 transition-all duration-300 rounded-xl shadow-lg ${
                isDragging ? 'opacity-50 transform scale-[1.02] shadow-lg z-10' : ''
              } ${servicesToShow.length > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-1.5 flex-1 min-w-0 py-0">
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onViewService(service)}
                  >
                    <div className="flex items-center space-x-1.5 mb-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rawPhone = service.rawCustomerPhoneInput || service.customerPhone || service.phoneNumber || '';
                          handlePhoneClick(rawPhone);
                        }} 
                        className="text-blue-300 hover:text-blue-100 hover:underline text-sm font-bold transition-all flex items-center py-0.5 rounded-md hover:bg-white/10"
                      >
                        {formatRawPhoneNumberWithColor(cleanPrefixes(service.rawCustomerPhoneInput || service.customerPhone || service.phoneNumber || ''))}
                      </button>
                    </div>
                    
                    <div className="flex items-start"> 
                     <p className={`text-sm font-normal ${getTextColorClass(service.color || 'white')} line-clamp-2 leading-snug break-words overflow-wrap-anywhere`}>
                        {cleanPrefixes(service.address || service.description || '')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1 ml-1">
                  <div className="flex items-center space-x-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareService(service);
                    }}
                    className={`p-1 text-white opacity-60 hover:opacity-100 transition-all rounded-md hover:bg-white/10`}
                  >
                    <ShareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditService(service);
                    }}
                    className={`p-1 text-white opacity-60 hover:opacity-100 transition-all rounded-md hover:bg-white/10`}
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteService(service.id);
                    }}
                    className={`p-1 text-white opacity-60 hover:opacity-100 transition-all rounded-md hover:bg-white/10`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  </div>
                  
                  {/* Deposit Display */}
                  {service.deposit !== undefined && service.deposit > 0 && (
                    <div className="text-xs text-green-300 font-normal">
                      {service.deposit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {servicesToShow.length === 0 && statusFilter !== 'all' && (
        <div className="p-4 text-center text-zinc-400 text-sm">
          {searchTerm ? 'Arama sonucuna uygun kayıt bulunamadı' : 'Henüz servis kaydı bulunmuyor'}
        </div>
      )}
      
      {shareModalService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-zinc-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Paylaş</h3>
                <button
                  onClick={() => setShareModalService(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <button
                onClick={() => handleShareToWhatsApp(shareModalService)}
                className="w-full flex items-center space-x-3 p-4 bg-green-900/20 hover:bg-green-900/30 rounded-xl transition-all duration-200 min-h-[60px] border border-green-800 hover:border-green-700"
              >
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                  </svg>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-semibold text-green-100">WhatsApp</div>
                  <div className="text-sm text-green-300">WhatsApp'ta paylaş</div>
                </div>
              </button>
              
              <button
                onClick={() => handleCopyToClipboard(shareModalService)}
                className="w-full flex items-center space-x-3 p-4 bg-blue-900/20 hover:bg-blue-900/30 rounded-xl transition-all duration-200 min-h-[60px] border border-blue-800 hover:border-blue-700"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-semibold text-blue-100">Kopyala</div>
                  <div className="text-sm text-blue-300">Panoya kopyala</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {statusFilter === 'all' && (
        <div className="p-6 text-center text-zinc-400 flex flex-col justify-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#2f3d4b] border border-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">STS</span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Kategori Seçin</h3>
          <p className="text-sm text-zinc-400 mb-3">
            Servisleri görmek için yukarıdan bir kategori seçin
          </p>
          
          <div className="corporate-card-frame rounded-lg p-2 bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="text-center">
              <p className="text-xs text-zinc-300 font-medium leading-tight">Toplam Servis</p>
              <p className="text-base font-bold text-white leading-tight">{services.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceListView;