import React, { useRef } from 'react';
import { SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const addServiceBtnRef = useRef<HTMLButtonElement>(null);
  const plusIconRef = useRef<HTMLDivElement>(null);

  const handleAddServiceClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Yeni servis ekleme işlemi başlatıldı');
    
    // Dispatch custom event for App.tsx
    const event = new CustomEvent('addNewService');
    window.dispatchEvent(event);

    // Enhanced click animation
    const btn = addServiceBtnRef.current;
    const plusIcon = plusIconRef.current;

    if (btn && plusIcon) {
      // Button press animation
      btn.style.transform = 'translateY(-2px) scale(0.95)';
      
      // Plus icon spin animation
      plusIcon.style.transform = 'rotate(180deg) scale(1.2)';
      
      // Ripple effect
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
      `;
      
      btn.appendChild(ripple);
      
      setTimeout(() => {
        btn.style.transform = '';
        plusIcon.style.transform = '';
        ripple.remove();
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (addServiceBtnRef.current) {
      addServiceBtnRef.current.style.background = 'rgba(255, 255, 255, 0.15)';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (addServiceBtnRef.current) {
      setTimeout(() => {
        if (addServiceBtnRef.current) {
          addServiceBtnRef.current.style.background = '';
        }
      }, 100);
    }
  };

  const handleSettingsClick = () => {
    const event = new CustomEvent('openSettingsPanel');
    window.dispatchEvent(event);
  };
  return ( 
    <div className="header-container" id="headerContainer">
      <div className="header-content">
        <div className="brand-section">
          <div className="logo-container">
            <span className="logo-text">STS</span>
          </div>
          <div className="brand-title">Servis</div>
          <div className="brand-title">Takip</div>
        </div>
        
        <div className="action-section">
          <button 
            className="add-service-btn" 
            onClick={handleSettingsClick}
            style={{ padding: '10px' }}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          
          <button 
            ref={addServiceBtnRef}
            className="add-service-btn" 
            id="addServiceBtn"
            onClick={handleAddServiceClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div ref={plusIconRef} className="plus-icon">+</div>
            <span className="btn-text">Yeni Servis</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;