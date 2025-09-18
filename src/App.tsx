import React, { useState, useRef } from 'react';
import Header from './components/Header';
import ServiceListView from './components/ServiceListView';
import ServiceForm from './components/ServiceForm';
import Notes from './components/Notes';
import Reports from './components/Reports';
import Backup from './components/Backup';
import ServiceDetail from './components/ServiceDetail';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/SettingsPanel';
import { ServiceRecord } from './types';
import { saveServiceOrder, applySavedOrder, generateId, formatPhoneNumberForStorage } from './utils/helpers.tsx';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

function App() {
  const [page, setPage] = useState(() => {
    try {
      const lastPage = localStorage.getItem('sts_last_page');
      return lastPage || 'dashboard';
    } catch (error) {
      console.error('Failed to load last page from localStorage:', error);
      return 'dashboard';
    }
  });
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceRecord | undefined>(undefined);
  const [missingParts, setMissingParts] = useState<string[]>([]);
  const [viewingService, setViewingService] = useState<ServiceRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'workshop' | 'completed'>(() => {
    try {
      const savedStatusFilter = localStorage.getItem('sts_status_filter');
      return (savedStatusFilter as 'all' | 'ongoing' | 'workshop' | 'completed') || 'all';
    } catch (error) {
      console.error('Failed to load status filter from localStorage:', error);
      return 'all';
    }
  });
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [gradientColors, setGradientColors] = useState({ color1: '#2f3d4b', color2: '#1a202c' });
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);

  // Ref for the main scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    loadData();
    loadThemeSettings();
  }, []);

  const loadThemeSettings = () => {
    try {
      const savedImageUrl = localStorage.getItem('sts_background_image');
      const savedGradient = localStorage.getItem('sts_gradient_colors');
      const savedOverlayColor = localStorage.getItem('sts_overlay_color');
      const savedOverlayOpacity = localStorage.getItem('sts_overlay_opacity');
      
      if (savedImageUrl) {
        setBackgroundImageUrl(savedImageUrl);
      }
      
      if (savedGradient) {
        const parsedGradient = JSON.parse(savedGradient);
        setGradientColors(parsedGradient);
      }
      
      if (savedOverlayColor) {
        setOverlayColor(savedOverlayColor);
      }
      
      if (savedOverlayOpacity) {
        setOverlayOpacity(parseFloat(savedOverlayOpacity));
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  };

  const loadData = () => {
    try {
      setLoading(true);
      loadServices();
      loadNotes();
      loadMissingParts();
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      setError('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setPage(event.detail);
      try {
        localStorage.setItem('sts_last_page', event.detail);
      } catch (error) {
        console.error('Failed to save last page to localStorage:', error);
      }
    };
    
    const handleAddNewService = () => {
      setSelectedService(undefined);
      setPage('newService');
      try {
        localStorage.setItem('sts_last_page', 'newService');
      } catch (error) {
        console.error('Failed to save last page to localStorage:', error);
      }
    };
    
    const handleOpenSettingsPanel = () => {
      setShowSettingsPanel(true);
    };
    
    window.addEventListener('navigate', handleNavigate as EventListener);
    window.addEventListener('addNewService', handleAddNewService as EventListener);
    window.addEventListener('openSettingsPanel', handleOpenSettingsPanel as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
      window.removeEventListener('addNewService', handleAddNewService as EventListener);
      window.removeEventListener('openSettingsPanel', handleOpenSettingsPanel as EventListener);
    };
  }, []);

  const loadServices = () => {
    try {
      setError(null);
      const savedServices = localStorage.getItem('sts_services');
      const servicesData = savedServices ? JSON.parse(savedServices) : [];
      
      const migratedServices = servicesData.map((service: any) => ({
        ...service,
        customerPhone: formatPhoneNumberForStorage(service.customerPhone || service.phoneNumber || ''),
        rawCustomerPhoneInput: service.rawCustomerPhoneInput || service.customerPhone || service.phoneNumber || '',
        address: service.address || service.description || '',
        cost: service.cost || service.feeCollected || 0,
        createdAt: service.createdAt || service.date || new Date().toISOString(),
        updatedAt: service.updatedAt || new Date().toISOString(),
        deposit: service.deposit || 0,
        phoneNumber: service.phoneNumber || service.customerPhone || '',
        description: service.description || service.address || '',
        feeCollected: service.feeCollected || service.cost || 0,
        phoneNumberNote: service.phoneNumberNote || '',
        date: service.date || service.createdAt || new Date().toISOString().split('T')[0],
      }));
      
      const orderedServices = applySavedOrder(migratedServices);
      setServices(orderedServices);
    } catch (error) {
      console.error('❌ Failed to load services:', error);
      setError('Servisler yüklenirken hata oluştu.');
    }
  };

  const loadNotes = () => {
    try {
      const savedNotes = localStorage.getItem('sts_notes');
      const notesData = savedNotes ? JSON.parse(savedNotes) : [];
      setNotes(notesData);
    } catch (error) {
      console.error('❌ Failed to load notes from localStorage:', error);
    }
  };

  const loadMissingParts = () => {
    try {
      const savedParts = localStorage.getItem('sts_missing_parts');
      const partsData = savedParts ? JSON.parse(savedParts) : [];
      setMissingParts(partsData);
    } catch (error) {
      console.error('❌ Failed to load missing parts from localStorage:', error);
    }
  };

  const handleEditService = (service: ServiceRecord) => {
    setSelectedService(service);
    setPage('newService');
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Bu servis kaydını silmek istediğinizden emin misiniz?')) {
      deleteService(id);
    }
  };

  const handleSaveService = (service: ServiceRecord) => {
    if (selectedService) {
      updateService(service);
    } else {
      createService(service);
    }
  };

  const navigateToPage = (newPage: string) => {
    setPage(newPage);
    try {
      localStorage.setItem('sts_last_page', newPage);
    } catch (error) {
      console.error('Failed to save last page to localStorage:', error);
    }
  };

  const handleReorderServices = (reorderedServices: ServiceRecord[]) => {
    setServices(reorderedServices);
    saveServiceOrder(reorderedServices);
    localStorage.setItem('sts_services', JSON.stringify(reorderedServices));
    setSelectedService(undefined);
  };

  const handleAddMissingPart = (missingPart: string) => {
    const updatedParts = [...missingParts, missingPart];
    setMissingParts(updatedParts);
    localStorage.setItem('sts_missing_parts', JSON.stringify(updatedParts));
  };

  const handleRemoveMissingPart = (index: number) => {
    const updatedParts = missingParts.filter((_, i) => i !== index);
    setMissingParts(updatedParts);
    localStorage.setItem('sts_missing_parts', JSON.stringify(updatedParts));
  };

  const handleViewService = (service: ServiceRecord) => {
    setViewingService(service);
  };

  const handleCloseServiceDetail = () => {
    setViewingService(null);
  };

  const handleEditFromDetail = (service: ServiceRecord) => {
    setSelectedService(service);
    setViewingService(null);
    navigateToPage('newService');
  };

  const handleStatusCardClick = (status: 'ongoing' | 'workshop' | 'completed') => {
    // Toggle functionality: if the same status is clicked, deselect it
    if (statusFilter === status) {
      setStatusFilter('all');
    } else {
      setStatusFilter(status);
    }
    try {
      const newFilter = statusFilter === status ? 'all' : status;
      localStorage.setItem('sts_status_filter', newFilter);
    } catch (error) {
      console.error('Failed to save status filter to localStorage:', error);
    }
  };

  const handleBackToAll = () => {
    setStatusFilter('all');
    try {
      localStorage.setItem('sts_status_filter', 'all');
    } catch (error) {
      console.error('Failed to save status filter to localStorage:', error);
    }
  };

  const createService = (service: ServiceRecord) => {
    try {
      setError(null);
      const newService = { 
        ...service, 
        id: service.id || generateId(),
        createdAt: service.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedServices = [newService, ...services];
      setServices(updatedServices);
      localStorage.setItem('sts_services', JSON.stringify(updatedServices));
      saveServiceOrder(updatedServices);
      navigateToPage('dashboard');
    } catch (error) {
      console.error('❌ Failed to create service:', error);
      setError('Servis kaydı oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const updateService = (service: ServiceRecord) => {
    try {
      setError(null);
      const updatedServices = services.map(s => 
        s.id === service.id 
          ? { ...service, updatedAt: new Date().toISOString() }
          : s
      );
      setServices(updatedServices);
      localStorage.setItem('sts_services', JSON.stringify(updatedServices));
      saveServiceOrder(updatedServices);
      navigateToPage('dashboard');
    } catch (error) {
      console.error('❌ Failed to update service:', error);
      setError('Servis kaydı güncellenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const deleteService = (id: string) => {
    try {
      setError(null);
      const updatedServices = services.filter(s => s.id !== id);
      setServices(updatedServices);
      localStorage.setItem('sts_services', JSON.stringify(updatedServices));
    } catch (error) {
      console.error('❌ Failed to delete service:', error);
      setError('Servis kaydı silinirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleAddNote = (note: Note) => {
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    localStorage.setItem('sts_notes', JSON.stringify(updatedNotes));
  };

  const handleEditNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note => note.id === updatedNote.id ? updatedNote : note);
    setNotes(updatedNotes);
    localStorage.setItem('sts_notes', JSON.stringify(updatedNotes));
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('sts_notes', JSON.stringify(updatedNotes));
    }
  };

  const handleExportData = () => {
    try {
      const transformedServices = services.map(service => ({
        id: service.id,
        customerPhone: service.customerPhone || service.phoneNumber || '',
        address: service.address || service.description || '',
        color: service.color || 'white',
        cost: service.cost || service.feeCollected || 0,
        expenses: service.expenses || 0,
        status: service.status,
        createdAt: service.createdAt || service.date || new Date().toISOString(),
        updatedAt: service.updatedAt || new Date().toISOString()
      }));

      const data = {
        services: transformedServices,
        notes,
        missingParts,
        exportDate: new Date().toISOString()
      };
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boltyedek.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('Yedekleme başarıyla tamamlandı');
    } catch (error) {
      alert('Yedekleme sırasında bir hata oluştu');
    }
  };

  const handleImportData = (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const actualData = data.data ? data.data : data;
          
          if (actualData.services) {
            localStorage.setItem('sts_services', JSON.stringify(actualData.services));
          }
          if (actualData.notes) {
            localStorage.setItem('sts_notes', JSON.stringify(actualData.notes));
          }
          if (actualData.missingParts) {
            localStorage.setItem('sts_missing_parts', JSON.stringify(actualData.missingParts));
          }
          
          loadData();
          
          const serviceCount = actualData.services ? actualData.services.length : 0;
          const noteCount = actualData.notes ? actualData.notes.length : 0;
          alert(`Veriler başarıyla yüklendi!\n${serviceCount} servis kaydı ve ${noteCount} not geri yüklendi.`);
        } catch (error) {
          alert('Dosya formatı geçersiz');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      alert('Dosya yüklenirken bir hata oluştu');
    }
  };

  const handleBackgroundImageChange = (url: string) => {
    setBackgroundImageUrl(url);
    try {
      if (url) {
        localStorage.setItem('sts_background_image', url);
      } else {
        localStorage.removeItem('sts_background_image');
      }
    } catch (error) {
      console.error('Failed to save background image:', error);
    }
  };

  const handleGradientChange = (colors: { color1: string; color2: string }) => {
    setGradientColors(colors);
    try {
      localStorage.setItem('sts_gradient_colors', JSON.stringify(colors));
    } catch (error) {
      console.error('Failed to save gradient colors:', error);
    }
  };

  const handleOverlayColorChange = (color: string) => {
    setOverlayColor(color);
    try {
      localStorage.setItem('sts_overlay_color', color);
    } catch (error) {
      console.error('Failed to save overlay color:', error);
    }
  };

  const handleOverlayOpacityChange = (opacity: number) => {
    setOverlayOpacity(opacity);
    try {
      localStorage.setItem('sts_overlay_opacity', opacity.toString());
    } catch (error) {
      console.error('Failed to save overlay opacity:', error);
    }
  };
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <ServiceListView
            services={services} 
            statusFilter={statusFilter}
            onEditService={handleEditService}
            onDeleteService={handleDeleteService}
            onViewService={handleViewService}
            onReorderServices={handleReorderServices}
            onBackToAll={handleBackToAll}
            scrollContainerRef={scrollContainerRef}
          />
        );
      case 'notes':
        return (
          <Notes
            notes={notes}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        );
      case 'reports':
        return (
          <Reports services={services} onViewService={handleViewService} />
        );
      case 'backup':
        return (
          <Backup
            onExportData={handleExportData}
            onImportData={handleImportData}
            servicesCount={services.length}
            notesCount={notes.length}
          />
        );
      case 'newService':
        return (
          <ServiceForm
            service={selectedService}
            onSave={handleSaveService}
            onCancel={() => navigateToPage('dashboard')}
          />
        );
      default:
        return (
          <ServiceListView 
            services={services} 
            statusFilter={statusFilter} 
            onEditService={handleEditService} 
            onDeleteService={handleDeleteService} 
            onViewService={handleViewService} 
            onReorderServices={handleReorderServices} 
            onBackToAll={handleBackToAll} 
            scrollContainerRef={scrollContainerRef}
          />
        );
    }
  };

  return (
    <>
      <div 
        className="background-glow-container"
        style={{
          background: backgroundImageUrl 
            ? `url(${backgroundImageUrl}) center/cover no-repeat fixed`
            : `linear-gradient(135deg, ${gradientColors.color1} 0%, ${gradientColors.color2} 100%)`
        }}
      >
        {!backgroundImageUrl && (
          <>
            <div className="glow g1"></div>
            <div className="glow g2"></div>
            <div className="glow g3"></div>
            <div className="pulsing-circle pulse-1"></div>
            <div className="pulsing-circle pulse-2"></div>
            <div className="pulsing-circle pulse-3"></div>
            <div className="pulsing-circle pulse-4"></div>
            <div className="pulsing-circle pulse-5"></div>
          </>
        )}
        
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
            zIndex: 1
          }}
        />
      </div>
      <div className="h-screen relative text-zinc-100 flex flex-col bg-transparent">
        {/* Fixed Header */}
        <Header 
          onNavigate={setPage} 
          currentPage={page}
        />
        
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Veriler yükleniyor...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 m-4">
            <div className="flex items-center">
              <div className="text-red-300 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-100 font-medium">Hata</h3>
                <p className="text-red-200 text-sm">{error}</p>
                <button 
                  onClick={loadData}
                  className="mt-2 text-red-300 hover:text-red-100 text-sm underline"
                >
                  Yeniden yükle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto hide-scrollbar" 
          style={{ paddingTop: 'var(--header-height)' }}
        >
          <div className="p-2 space-y-2">
            <Dashboard 
              services={services} 
              missingParts={missingParts}
              onAddMissingPart={handleAddMissingPart}
              onRemoveMissingPart={handleRemoveMissingPart}
              currentPage={page}
              statusFilter={statusFilter}
              onStatusCardClick={handleStatusCardClick}
            />
            
            <main>
              {renderPage()}
            </main>
          </div>
        </div>
        
        {viewingService && (
          <ServiceDetail
            service={viewingService}
            onClose={handleCloseServiceDetail}
            onEdit={handleEditFromDetail}
          />
        )}
        
        <SettingsPanel
          isOpen={showSettingsPanel}
          onClose={() => setShowSettingsPanel(false)}
          backgroundImageUrl={backgroundImageUrl}
          gradientColors={gradientColors}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          onBackgroundImageChange={handleBackgroundImageChange}
          onGradientChange={handleGradientChange}
          onOverlayColorChange={handleOverlayColorChange}
          onOverlayOpacityChange={handleOverlayOpacityChange}
        />
      </div>
    </>
  );
}

export default App;