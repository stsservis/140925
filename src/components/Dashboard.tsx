import React, { useState } from 'react';
import { 
  ClockIcon, 
  WrenchIcon,
  CheckCircleIcon
} from 'lucide-react';
import { ServiceRecord } from '../types';
import { calculateDashboardStats } from '../utils/helpers';

interface DashboardProps {
  services: ServiceRecord[];
  missingParts: string[];
  onAddMissingPart: (missingPart: string) => void;
  onRemoveMissingPart: (index: number) => void;
  currentPage: string;
  statusFilter: 'all' | 'ongoing' | 'workshop' | 'completed';
  onStatusCardClick: (status: 'ongoing' | 'workshop' | 'completed') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  services, 
  missingParts, 
  onAddMissingPart, 
  onRemoveMissingPart,
  currentPage,
  statusFilter,
  onStatusCardClick
}) => {
  const stats = calculateDashboardStats(services);

  // Get ongoing services
  const ongoingServices = services.filter(service => service.status === 'ongoing');
  const workshopServices = services.filter(service => service.status === 'workshop');
  const completedServices = services.filter(service => service.status === 'completed');

  return (
    <div className="space-y-2">
      {/* Status Cards with Unified Background */} 
      <div className="corporate-card-frame rounded-xl relative overflow-hidden">
        <div className="flex gap-2 p-2 relative z-10">
          <button 
            onClick={() => onStatusCardClick('ongoing')}
            className={`bg-blue-900/20 border border-blue-800 relative py-1 px-2 rounded-lg font-medium text-xxs transition-all duration-300 whitespace-nowrap text-center min-h-[42px] flex flex-col items-center justify-center flex-1 ${
              statusFilter === 'ongoing' 
                ? 'bg-blue-900/40 text-blue-100 border-blue-500 status-card-active-blue-glow'
                : 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/25 border border-blue-800'
            }`}
          >
            <div className="flex flex-col items-center space-y-0">
              <ClockIcon className="h-3 w-3 mb-0.5" />
              <span className="leading-tight font-normal text-xxs">Devam Edenler</span>
              <span className="text-xs font-bold">{ongoingServices.length}</span>
            </div>
          </button>

          <button 
            onClick={() => onStatusCardClick('workshop')}
            className={`bg-orange-900/20 border border-orange-800 relative py-1 px-2 rounded-lg font-medium text-xxs transition-all duration-300 whitespace-nowrap text-center min-h-[42px] flex flex-col items-center justify-center flex-1 ${
              statusFilter === 'workshop' 
                ? 'bg-orange-900/40 text-orange-100 border-orange-500 status-card-active-orange-glow'
                : 'text-orange-300 hover:text-orange-200 hover:bg-orange-900/25 border border-orange-800'
            }`}
          >
            <div className="flex flex-col items-center space-y-0">
              <WrenchIcon className="h-3 w-3 mb-0.5" />
              <span className="leading-tight font-normal text-xxs">Atölyede</span>
              <span className="text-xs font-bold">{workshopServices.length}</span>
            </div>
          </button>

          <button 
            onClick={() => onStatusCardClick('completed')}
            className={`bg-green-900/20 border border-green-800 relative py-1 px-2 rounded-lg font-medium text-xxs transition-all duration-300 whitespace-nowrap text-center min-h-[42px] flex flex-col items-center justify-center flex-1 ${
              statusFilter === 'completed' 
                ? 'bg-green-900/40 text-green-100 border-green-500 status-card-active-green-glow'
                : 'text-green-300 hover:text-green-200 hover:bg-green-900/25 border border-green-800'
            }`}
          >
            <div className="flex flex-col items-center space-y-0">
              <CheckCircleIcon className="h-3 w-3 mb-0.5" />
              <span className="leading-tight font-normal text-xxs">Tamamlanan</span>
              <span className="text-xs font-bold">{completedServices.length}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="corporate-card-frame rounded-xl relative overflow-hidden">
        <div className="flex justify-around gap-1 p-2 relative z-10">
          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'dashboard' });
              window.dispatchEvent(event);
            }}
            className={`bg-zinc-900/20 border border-zinc-700 relative py-1.5 px-1.5 rounded-lg font-medium text-xxs transition-all duration-300 whitespace-nowrap text-center min-h-[40px] flex flex-col items-center justify-center flex-1 ${
              currentPage === 'dashboard'
                ? 'bg-blue-900/40 text-blue-100 transform scale-[1.02] nav-tab-active-glow'
                : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/25'
            }`}
          >
            <div className="flex flex-col items-center space-y-0">
              <WrenchIcon className="h-3 w-3 mb-0.5" />
              <span className="leading-tight font-normal text-xxs">Servisler</span>
            </div>
          </button>

          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'notes' });
              window.dispatchEvent(event);
            }}
            className={`bg-zinc-900/20 border border-zinc-700 relative py-1.5 px-1.5 rounded-lg font-medium text-xxs transition-all duration-300 whitespace-nowrap text-center min-h-[40px] flex flex-col items-center justify-center flex-1 ${
              currentPage === 'notes'
                ? 'bg-blue-900/40 text-blue-100 transform scale-[1.02] nav-tab-active-glow'
                : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/25'
            }`}
          >
            <div className="flex flex-col items-center space-y-0">
              <svg className="h-3 w-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="leading-tight font-normal text-xxs">Notlar</span>
            </div>
          </button>

          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'reports' });
              window.dispatchEvent(event);
            }}
            className={`bg-zinc-900/20 border border-zinc-700 relative py-1.5 px-1.5 rounded-lg font-medium text-xxs transition-all duration-300 whitespace-nowrap text-center min-h-[40px] flex flex-col items-center justify-center flex-1 ${
              currentPage === 'reports'
                ? 'bg-blue-900/40 text-blue-100 transform scale-[1.02] nav-tab-active-glow'
                : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/25'
            }`}
          >
            <div className="flex flex-col items-center space-y-0">
              <svg className="h-3 w-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="leading-tight font-normal text-xxs">Raporlar</span>
            </div>
          </button>

          <button
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'backup' });
              window.dispatchEvent(event);
            }}
            className={`bg-zinc-900/20 border border-zinc-700 relative py-1.5 px-1.5 rounded-lg font-medium text-xxs transition-all duration-300 whitespace-nowrap text-center min-h-[40px] flex flex-col items-center justify-center flex-1 ${
              currentPage === 'backup'
                ? 'bg-blue-900/40 text-blue-100 transform scale-[1.02] nav-tab-active-glow'
                : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/25'
            }`}
          >
            <div className="flex flex-col items-center space-y-0">
              <svg className="h-3 w-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span className="leading-tight font-normal text-xxs">Yedekleme</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;