import React, { useRef } from 'react';
import { Camera, Upload, Plus, X, Loader2, Eye, Lock, Hourglass } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PhotoPickerProps {
  pendingPhotoUrl: string;
  photoStatus: string;
  uploading: boolean;
  onMainPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gallery: { id: string; url: string; status: string }[];
  galleryFiles: { id: string; file: File }[];
  onGalleryAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGallery: (id: string) => void;
  photoPrivacy: string;
  onPrivacyChange: (privacy: string) => void;
  hasError?: boolean;
}

export default function PhotoPicker({
  pendingPhotoUrl,
  photoStatus,
  uploading,
  onMainPhotoChange,
  gallery,
  onGalleryAdd,
  onRemoveGallery,
  photoPrivacy,
  onPrivacyChange,
  hasError
}: PhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="bg-[#f1f5f9] rounded-[24px] p-6 border border-[#e2e8f0]">
        <h4 className="text-[15px] font-semibold text-[#1a2e4a] mb-5 flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#C9A84C]" />
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#b8860b]/80">
            Profile Photo <span className="text-[#dc2626] text-[11px] ml-[2px]">*</span>
          </span>
        </h4>

        <div className="flex items-center gap-6 flex-wrap">
          <div className={cn(
            "w-24 h-24 rounded-[16px] bg-[#f1f5f9] flex items-center justify-center border-2 border-dashed overflow-hidden shadow-inner flex-shrink-0 relative",
            hasError ? "border-[#dc2626]" : "border-[#e2e8f0]"
          )}>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#f1f5f9]/80 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
              </div>
            )}
            {pendingPhotoUrl ? (
              <div className="relative w-full h-full">
                <img src={pendingPhotoUrl} alt="Main" className="w-full h-full object-cover" />
                {photoStatus === 'pending' && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                    <div className="bg-[#C9A84C] text-[#040e2a] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg border border-[#C9A84C]/50">
                      <Hourglass className="w-3 h-3 text-[#040e2a]" /> Awaiting Approval
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Camera className="w-8 h-8 text-[#94a3b8]" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[13px] text-[#1a2e4a]">Upload a clear, high-quality portrait photo for your main profile.</p>
            <label className={cn(
              "inline-block cursor-pointer bg-[#C9A84C] text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-[#b8860b] transition-colors",
              uploading && "opacity-50 cursor-not-allowed pointer-events-none"
            )}>
              {pendingPhotoUrl ? "Change Photo" : "Upload Photo"}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onMainPhotoChange}
                className="hidden"
                accept="image/jpeg, image/png, image/webp, .jpg, .jpeg, .png, .webp"
                disabled={uploading}
              />
            </label>
            {hasError && (
              <p className="text-[#dc2626] text-[12px] mt-1">Profile photo is required.</p>
            )}
            <p className="text-[10px] text-[#64748b] mt-1">Please upload .Jpg files only and not more than 500 KB file size.</p>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="mt-6 pt-5 border-t border-[#e2e8f0]">
          <h4 className="text-[13px] font-semibold text-[#1a2e4a] mb-3">Photo Privacy Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPrivacyChange('public')}
              className={cn(
                "p-4 rounded-[14px] border flex flex-col items-center text-center gap-2 transition-colors",
                photoPrivacy === 'public'
                  ? "border-[#C9A84C] bg-[rgba(201,168,76,0.04)] text-[#b8860b]"
                  : "border-[#e2e8f0] hover:border-[#C9A84C]/50 text-[#64748b]"
              )}
            >
              <Eye className="w-5 h-5" />
              <div>
                <div className="font-bold text-[13px]">Public</div>
                <div className="text-[11px] opacity-80 mt-0.5">Visible to all members</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onPrivacyChange('accepted_only')}
              className={cn(
                "p-4 rounded-[14px] border flex flex-col items-center text-center gap-2 transition-colors",
                photoPrivacy === 'accepted_only'
                  ? "border-[#C9A84C] bg-[rgba(201,168,76,0.04)] text-[#b8860b]"
                  : "border-[#e2e8f0] hover:border-[#C9A84C]/50 text-[#64748b]"
              )}
            >
              <Lock className="w-5 h-5" />
              <div>
                <div className="font-bold text-[13px]">Protected</div>
                <div className="text-[11px] opacity-80 mt-0.5">Visible to accepted matches</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Photos */}
      <div className="bg-[#f1f5f9] rounded-[24px] p-6 border border-[#e2e8f0]">
        <h4 className="text-[15px] font-semibold text-[#1a2e4a] mb-2 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#C9A84C]" />
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#b8860b]/80">
            Gallery Photos <span className="text-[#c4bba8] italic text-[10px] ml-[3px] normal-case tracking-normal font-normal">(Optional)</span>
          </span>
        </h4>
        <p className="text-[13px] text-[#64748b] mb-5">Add up to 3 additional photos to showcase your lifestyle and personality.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.slice(0, 3).map(photo => (
            <div key={photo.id} className="relative aspect-square rounded-[16px] overflow-hidden border border-[#e2e8f0] group">
              <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
              {photo.status === 'pending' && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                  <div className="bg-[#C9A84C] text-[#040e2a] text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-[#C9A84C]/50">
                    <Hourglass className="w-2.5 h-2.5 text-[#040e2a]" /> Pending
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveGallery(photo.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {gallery.length < 3 && (
            <label className={cn(
              "aspect-square rounded-[16px] border-2 border-dashed bg-white flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A84C] hover:bg-[rgba(201,168,76,0.04)] transition-all relative",
              uploading && "opacity-50 cursor-not-allowed pointer-events-none"
            )}>
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
              ) : (
                <>
                  <Plus className="w-8 h-8 text-[#94a3b8]" />
                  <span className="text-[11px] text-[#94a3b8] mt-2 font-medium">Add Photo</span>
                </>
              )}
              <input
                type="file"
                ref={galleryInputRef}
                onChange={onGalleryAdd}
                className="hidden"
                accept="image/jpeg, image/png, image/webp, .jpg, .jpeg, .png, .webp"
                multiple
                disabled={uploading}
              />
            </label>
          )}
        </div>
        <p className="text-[10px] text-[#64748b] mt-3 text-center">Please upload .Jpg files only and not more than 500 KB file size.</p>
      </div>
    </div>
  );
}
