import React, { useRef, useState } from 'react';
import { Upload, X, ChevronLeft, ChevronRight, Star, RefreshCw } from 'lucide-react';
import { API_BASE, authHeaders, resolveImage } from '../../../utils/catalog';

export const uploadImages = async (files) => {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('images', f));
  const res = await fetch(`${API_BASE}/uploads`, { method: 'POST', headers: authHeaders(), body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
  return data.data.map((f) => f.url);
};

// Main image + gallery with preview, replace, remove, reorder and "set as main"
export default function ImageUploader({ mainImage, gallery = [], onChange, onError, allowGallery = true }) {
  const mainInput = useRef(null);
  const galleryInput = useRef(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (e) { onError && onError(e.message); } finally { setBusy(false); }
  };

  const setMain = (files) => run(async () => {
    const [url] = await uploadImages([files[0]]);
    onChange({ image_url: url, gallery });
  });
  const addGallery = (files) => run(async () => {
    const urls = await uploadImages(files);
    onChange({ image_url: mainImage, gallery: [...gallery, ...urls] });
  });
  const move = (i, d) => {
    const next = [...gallery];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ image_url: mainImage, gallery: next });
  };
  const promote = (i) => {
    const next = [...gallery];
    const [url] = next.splice(i, 1);
    if (mainImage) next.unshift(mainImage);
    onChange({ image_url: url, gallery: next });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-start">
        <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0 relative" style={{ border: '1px solid var(--line)', background: 'rgba(0,0,0,0.2)' }}>
          {mainImage ? <img src={resolveImage(mainImage)} alt="Main" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--muted)' }}>No image</div>}
          {busy && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><RefreshCw className="w-5 h-5 animate-spin text-white" /></div>}
        </div>
        <div className="space-y-1.5 text-xs">
          <span className="font-bold block">Main Image</span>
          <div className="flex gap-2 flex-wrap">
            <button type="button" disabled={busy} onClick={() => mainInput.current?.click()} className="px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer" style={{ border: '1px solid var(--line)' }}><Upload className="w-3.5 h-3.5" /> {mainImage ? 'Replace' : 'Upload'}</button>
            {mainImage && <button type="button" onClick={() => onChange({ image_url: null, gallery })} className="px-3 py-1.5 rounded-lg font-bold text-rose-400 cursor-pointer" style={{ border: '1px solid rgba(244,63,94,0.4)' }}>Remove</button>}
          </div>
          <span className="block text-[10px]" style={{ color: 'var(--muted)' }}>PNG, JPG, WEBP or GIF — max 5 MB</span>
          <input ref={mainInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => e.target.files?.length && setMain(e.target.files)} />
        </div>
      </div>

      {allowGallery && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">Gallery ({gallery.length})</span>
            <button type="button" disabled={busy} onClick={() => galleryInput.current?.click()} className="px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer" style={{ border: '1px solid var(--line)' }}><Upload className="w-3 h-3" /> Add images</button>
            <input ref={galleryInput} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => e.target.files?.length && addGallery(e.target.files)} />
          </div>
          {gallery.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {gallery.map((url, i) => (
                <div key={`${url}-${i}`} className="w-24 rounded-lg overflow-hidden" style={{ border: '1px solid var(--line)' }}>
                  <img src={resolveImage(url)} alt="" className="w-24 h-16 object-cover" />
                  <div className="flex justify-between px-1 py-0.5 text-[10px]">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="cursor-pointer disabled:opacity-30" title="Move left"><ChevronLeft className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => promote(i)} className="cursor-pointer text-amber-400" title="Set as main image"><Star className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => onChange({ image_url: mainImage, gallery: gallery.filter((_, j) => j !== i) })} className="cursor-pointer text-rose-400" title="Remove"><X className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === gallery.length - 1} className="cursor-pointer disabled:opacity-30" title="Move right"><ChevronRight className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
