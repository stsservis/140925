import React, { useState, useEffect } from 'react';
import { XIcon, ImageIcon, PaletteIcon } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundImageUrl: string;
  gradientColors: { color1: string; color2: string };
  onBackgroundImageChange: (url: string) => void;
  onGradientChange: (colors: { color1: string; color2: string }) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  backgroundImageUrl,
  gradientColors,
  onBackgroundImageChange,
  onGradientChange,
}) => {
  const [imageUrl, setImageUrl] = useState(backgroundImageUrl);
  const [color1, setColor1] = useState(gradientColors.color1);
  const [color2, setColor2] = useState(gradientColors.color2);
  const [activeTab, setActiveTab] = useState<'image' | 'gradient'>('gradient');

  useEffect(() => {
    setImageUrl(backgroundImageUrl);
    setColor1(gradientColors.color1);
    setColor2(gradientColors.color2);
  }, [backgroundImageUrl, gradientColors]);

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    onBackgroundImageChange(url);
    if (url) {
      setActiveTab('image');
    }
  };

  const handleGradientChange = (newColor1: string, newColor2: string) => {
    setColor1(newColor1);
    setColor2(newColor2);
    onGradientChange({ color1: newColor1, color2: newColor2 });
    setActiveTab('gradient');
  };

  const clearBackground = () => {
    setImageUrl('');
    onBackgroundImageChange('');
    setActiveTab('gradient');
  };

  const presetGradients = [
    { name: 'Varsayılan', color1: '#2f3d4b', color2: '#1a202c' },
    { name: 'Gece', color1: '#0f172a', color2: '#1e293b' },
    { name: 'Okyanus', color1: '#0c4a6e', color2: '#164e63' },
    { name: 'Orman', color1: '#14532d', color2: '#166534' },
    { name: 'Günbatımı', color1: '#7c2d12', color2: '#dc2626' },
    { name: 'Mor Rüya', color1: '#581c87', color2: '#7c3aed' },
    { name: 'Pembe', color1: '#be185d', color2: '#ec4899' },
    { name: 'Turuncu', color1: '#c2410c', color2: '#f97316' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 p-3 flex items-center justify-center">
      <div className="bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-700/50 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900/60 backdrop-blur-md px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-zinc-700/50">
          <h2 className="text-lg font-semibold text-white">Tema Ayarları</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:bg-white/10 p-2 rounded-lg transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Tab Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('gradient')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all ${
                activeTab === 'gradient'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70'
              }`}
            >
              <PaletteIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Degrade</span>
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all ${
                activeTab === 'image'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Resim</span>
            </button>
          </div>

          {/* Gradient Section */}
          {activeTab === 'gradient' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Özel Degrade Renkleri
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Renk 1</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => handleGradientChange(e.target.value, color2)}
                        className="w-10 h-10 rounded-lg border border-zinc-600 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color1}
                        onChange={(e) => handleGradientChange(e.target.value, color2)}
                        className="flex-1 px-2 py-2 text-xs bg-zinc-800/50 border border-zinc-600 rounded-lg text-zinc-100 focus:ring-1 focus:ring-blue-500/50"
                        placeholder="#2f3d4b"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Renk 2</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => handleGradientChange(color1, e.target.value)}
                        className="w-10 h-10 rounded-lg border border-zinc-600 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color2}
                        onChange={(e) => handleGradientChange(color1, e.target.value)}
                        className="flex-1 px-2 py-2 text-xs bg-zinc-800/50 border border-zinc-600 rounded-lg text-zinc-100 focus:ring-1 focus:ring-blue-500/50"
                        placeholder="#1a202c"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Gradients */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Hazır Degrade Temaları
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetGradients.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleGradientChange(preset.color1, preset.color2)}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 border border-zinc-700/50 transition-all"
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-zinc-600"
                        style={{
                          background: `linear-gradient(135deg, ${preset.color1} 0%, ${preset.color2} 100%)`
                        }}
                      />
                      <span className="text-xs text-zinc-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Section */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Arka Plan Resmi URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:ring-1 focus:ring-blue-500/50 text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Resim URL'si girin. Resim tam sayfa arka planında görünecek.
                </p>
              </div>

              {imageUrl && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Önizleme
                  </label>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-600">
                    <img
                      src={imageUrl}
                      alt="Arka plan önizleme"
                      className="w-full h-full object-cover"
                      onError={() => {
                        // Handle image load error
                      }}
                    />
                  </div>
                  <button
                    onClick={clearBackground}
                    className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg border border-red-500/30 transition-all text-sm"
                  >
                    Resmi Kaldır
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Current Preview */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Mevcut Tema Önizleme
            </label>
            <div
              className="w-full h-20 rounded-lg border border-zinc-600 relative overflow-hidden"
              style={{
                background: imageUrl 
                  ? `url(${imageUrl}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
              }}
            >
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="text-white text-sm font-medium drop-shadow-lg">
                  STS Servis Takip
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-zinc-900/60 backdrop-blur-md border-t border-zinc-700/50 p-4">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/30 transition-all font-medium"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;