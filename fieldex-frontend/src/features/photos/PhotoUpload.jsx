import { useState, useRef } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import { getPosition, extractError } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function PhotoUpload({ visitId, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [coords, setCoords] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    // Try to get GPS from browser
    getPosition()
      .then((pos) => setCoords(pos))
      .catch(() => {});
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      if (coords) {
        form.append('lat', coords.lat);
        form.append('lng', coords.lng);
      }
      const { data } = await api.post(`/visits/${visitId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Foto subida correctamente');
      onSuccess?.(data.data);
      setPreview(null);
      setFile(null);
      setCoords(null);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-50 transition-colors"
      >
        {preview ? (
          <img src={preview} alt="" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <>
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm text-slate-500">Toca para seleccionar una foto</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
      </div>

      {coords && (
        <p className="text-xs text-green-600 text-center font-mono">
          📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      )}

      {file && (
        <div className="flex gap-3">
          <Button onClick={handleUpload} loading={uploading} className="flex-1">
            Subir foto
          </Button>
          <Button variant="secondary" onClick={() => { setFile(null); setPreview(null); setCoords(null); }}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
