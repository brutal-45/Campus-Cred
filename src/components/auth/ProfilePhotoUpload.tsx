'use client'; 

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Crop, Check } from 'lucide-react';

interface ProfilePhotoUploadProps {
  onPhotoSelect: (file: File | null, previewUrl: string | null) => void;
  fullName: string;
}

const GRADIENT_PALETTES = [
  ['#3B82F6', '#8B5CF6'],
  ['#10B981', '#3B82F6'],
  ['#F59E0B', '#EF4444'],
  ['#8B5CF6', '#EC4899'],
  ['#06B6D4', '#3B82F6'],
  ['#F97316', '#F59E0B'],
  ['#EF4444', '#8B5CF6'],
  ['#10B981', '#8B5CF6'],
  ['#EC4899', '#8B5CF6'],
  ['#14B8A6', '#3B82F6'],
];

function getInitials(name: string): string {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

function getGradientForName(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index] as [string, string];
}

export function ProfilePhotoUpload({ onPhotoSelect, fullName }: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState<{ url: string; file: File } | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50, zoom: 100 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = getInitials(fullName);
  const gradient = getGradientForName(fullName || 'default');

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only JPG, PNG, and WEBP images are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setCropData({ url, file });
        setCropPosition({ x: 50, y: 50, zoom: 100 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const applyCrop = useCallback(() => {
    if (!cropData) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      canvas.width = 400;
      canvas.height = 400;

      const offsetX = (img.width - size) * (cropPosition.x / 100);
      const offsetY = (img.height - size) * (cropPosition.y / 100);

      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 400, 400);

      const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(croppedUrl);
      onPhotoSelect(cropData.file, croppedUrl);
      setShowCropModal(false);
      setCropData(null);
    };
    img.src = cropData.url;
  }, [cropData, cropPosition, onPhotoSelect]);

  const removePhoto = useCallback(() => {
    setPreview(null);
    onPhotoSelect(null, null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onPhotoSelect]);

  return (
    <>
      <div className="space-y-3">
        <label className="text-navy text-sm font-medium flex items-center gap-2">
          <Camera className="w-4 h-4 text-text-secondary" />
          Profile Photo
          <span className="text-text-secondary text-xs">(optional)</span>
        </label>

        <div className="flex items-start gap-4">
          {/* Avatar Preview */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#E2E8F0] shadow-lg">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
                >
                  {initials}
                </div>
              )}
            </div>
            {preview && (
              <button
                onClick={removePhoto}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {!preview && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-electric/80 flex items-center justify-center text-white shadow-md border-2 border-white">
                <span className="text-[8px] font-bold">?</span>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="flex-1">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-electric bg-electric/10'
                  : 'border-[#E2E8F0] hover:border-electric/50'
              }`}
              style={!isDragging ? { backgroundColor: '#F8FAFC' } : undefined}
            >
              <Upload className={`w-5 h-5 mx-auto mb-1.5 ${isDragging ? 'text-electric' : 'text-text-secondary'}`} />
              <p className="text-xs text-text-secondary">
                <span className="text-electric font-medium">Click to upload</span> or drag & drop
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5">JPG, PNG, WEBP &middot; Max 5MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </div>

        {!preview && (
          <p className="text-[10px] text-text-secondary flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }} />
            Auto-generated avatar from your initials
          </p>
        )}

        {error && (
          <p className="text-red-400 text-xs animate-fade-in">
            {error}
          </p>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && cropData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowCropModal(false)}
        >
          <div
            className="bg-white border border-[#E2E8F0] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
                <Crop className="w-5 h-5 text-electric" />
                Crop Your Photo
              </h3>
              <button onClick={() => setShowCropModal(false)} className="text-text-secondary hover:text-navy transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/50 mb-4">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <img
                  src={cropData.url}
                  alt="Crop preview"
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${cropPosition.zoom / 100})` }}
                />
              </div>
              <div className="absolute inset-4 border-2 border-electric/50 rounded-lg pointer-events-none">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-electric rounded-tl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-electric rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-electric rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-electric rounded-br" />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-4 bg-black/40" />
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/40" />
                <div className="absolute top-4 bottom-4 left-0 w-4 bg-black/40" />
                <div className="absolute top-4 bottom-4 right-0 w-4 bg-black/40" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-text-secondary mb-1.5 block">Zoom</label>
              <input
                type="range"
                min="50"
                max="200"
                value={cropPosition.zoom}
                onChange={(e) => setCropPosition((prev) => ({ ...prev, zoom: parseInt(e.target.value) }))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCropModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-text-secondary text-sm font-medium hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button onClick={applyCrop} className="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity active:scale-[0.97]">
                <Check className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
