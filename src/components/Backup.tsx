import React, { useRef } from 'react';
import { DownloadIcon, UploadIcon, DatabaseIcon, CheckCircleIcon } from 'lucide-react';

interface BackupProps {
  onExportData: () => void;
  onImportData: (file: File) => void;
  servicesCount: number;
  notesCount: number;
}

const Backup: React.FC<BackupProps> = ({ onExportData, onImportData, servicesCount, notesCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-3 border border-blue-400/20 min-h-[60px] shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-blue-300 leading-tight">Toplam Servis</h3>
              <p className="text-sm font-bold text-blue-100">{servicesCount}</p>
            </div>
            <DatabaseIcon className="h-3.5 w-3.5 text-blue-300" />
          </div>
        </div>

        <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-3 border border-green-400/20 min-h-[60px] shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-green-300 leading-tight">Toplam Not</h3>
              <p className="text-sm font-bold text-green-200">{notesCount}</p>
            </div>
            <CheckCircleIcon className="h-3.5 w-3.5 text-green-300" />
          </div>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-lg border border-white/10">
        <div className="p-3">
          <h2 className="text-xs font-semibold text-zinc-100 mb-2">Yedekleme İşlemleri</h2>
          
          <div className="space-y-2">
            {/* Export */}
            <div className="border border-white/10 rounded-lg p-3 bg-white/5 backdrop-blur-md shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xs font-medium text-zinc-100 mb-1">Veri Yedekleme</h3>
                  <p className="text-xs text-zinc-300 mb-2 leading-snug">
                    Tüm servis kayıtlarınızı ve notlarınızı JSON dosyası olarak indirin.
                  </p>
                  <button
                    onClick={onExportData}
                    className="bg-blue-500/20 backdrop-blur-md text-white px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300 flex items-center space-x-1 text-xs min-h-[32px] border border-blue-400/20 hover:border-blue-400/30 shadow-md"
                  >
                    <DownloadIcon className="h-3 w-3" />
                    <span>Yedek Al</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Import */}
            <div className="border border-white/10 rounded-lg p-3 bg-white/5 backdrop-blur-md shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xs font-medium text-zinc-100 mb-1">Veri Geri Yükleme</h3>
                  <p className="text-xs text-zinc-300 mb-2 leading-snug">
                    Daha önce aldığınız yedek dosyasını sisteme geri yükleyin.
                  </p>
                  <button
                    onClick={handleImportClick}
                    className="bg-green-500/20 backdrop-blur-md text-white px-3 py-2 rounded-lg hover:bg-green-500/30 transition-all duration-300 flex items-center space-x-1 text-xs min-h-[32px] border border-green-400/20 hover:border-green-400/30 shadow-md"
                  >
                    <UploadIcon className="h-3 w-3" />
                    <span>Geri Yükle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-500/10 backdrop-blur-md rounded-xl p-3 border border-yellow-400/20 shadow-md">
        <h3 className="text-xs font-medium text-yellow-200 mb-1">Önemli Notlar</h3>
        <ul className="text-xs text-yellow-300 space-y-0.5 leading-snug">
          <li className="break-words">• Yedekleme işlemi tüm verilerinizi güvenli bir şekilde kaydeder</li>
          <li className="break-words">• Geri yükleme işlemi mevcut verilerin üzerine yazar</li>
          <li className="break-words">• Düzenli yedekleme almanızı öneririz</li>
        </ul>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Backup;