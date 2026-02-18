import { useState, useRef } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoUploadProps {
  value: string | null;
  onChange: (base64: string | null) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // Compress by drawing to canvas
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        onChange(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Photo</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="w-full max-w-[200px] rounded-lg border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              fileRef.current!.setAttribute('capture', 'environment');
              fileRef.current!.click();
            }}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-1" /> Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              fileRef.current!.removeAttribute('capture');
              fileRef.current!.click();
            }}
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-1" /> Gallery
          </Button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
