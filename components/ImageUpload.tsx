
import React, { useRef } from 'react';

interface ImageUploadProps {
  onUpload: (base64: string) => void;
  label: string;
  preview: string | null;
  icon: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, label, preview, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer aspect-[4/3] rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/50 overflow-hidden flex flex-col items-center justify-center transition-all"
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <i className="fa-solid fa-camera text-2xl text-white"></i>
            </div>
          </>
        ) : (
          <>
            <i className={`${icon} text-3xl text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors`}></i>
            <span className="text-slate-400 group-hover:text-indigo-300">Click to upload</span>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*" 
        />
      </div>
    </div>
  );
};
