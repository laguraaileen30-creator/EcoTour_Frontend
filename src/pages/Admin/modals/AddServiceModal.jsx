import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddServiceModal({ isOpen, onClose, serviceToEdit, onServiceSaved }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cottage');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(100);
  const [unit, setUnit] = useState('day');
  const [capacity, setCapacity] = useState(10);
  const [imageUrl, setImageUrl] = useState('/src/assets/images/services/cottage.png');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(serviceToEdit?.service_name || '');
      setCategory(serviceToEdit?.category || 'Cottage');
      setDesc(serviceToEdit?.description || '');
      setPrice(serviceToEdit?.price || 100);
      setUnit(serviceToEdit?.unit || 'day');
      setCapacity(serviceToEdit?.total_capacity || serviceToEdit?.quantity || 10);
      setImageUrl(serviceToEdit?.image_url || '/src/assets/images/services/cottage.png');
      setStatus(serviceToEdit?.status || 'Active');
    }
  }, [isOpen, serviceToEdit]);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      service_name: name,
      category,
      description: desc,
      price: parseFloat(price),
      unit,
      total_capacity: parseInt(capacity, 10),
      available_qty: parseInt(capacity, 10),
      image_url: imageUrl,
      status,
    };

    try {
      const sId = serviceToEdit?.service_id || serviceToEdit?.id;
      const url = sId
        ? `http://localhost:5000/api/v1/services/${sId}`
        : 'http://localhost:5000/api/v1/services';
      const method = sId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onServiceSaved) onServiceSaved();
        onClose();
      } else {
        alert(data.message || 'Error saving service');
      }
    } catch (err) {
      alert('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl max-w-md w-full space-y-3 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            {serviceToEdit ? `Edit ${serviceToEdit.service_name}` : 'Add New Resort Service'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700">Service Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Open VIP Cottage" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1">
              <option value="Entrance">Entrance Ticket</option>
              <option value="Cottage">Cottage</option>
              <option value="Rental">Table/Chair Rental</option>
              <option value="Safety">Safety Flotation</option>
              <option value="Entertainment">Videoke / Sound</option>
              <option value="Water Activity">Kayak / Water Sports</option>
              <option value="Accommodation">Camping & Room</option>
              <option value="Event">Event Pavilion</option>
              <option value="Food">Food & Catering</option>
              <option value="Parking">Parking</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700">Service Image</label>
            <select value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1">
              <option value="/src/assets/images/services/cottage.png">Cottage</option>
              <option value="/src/assets/images/services/table.png">Table & Chairs</option>
              <option value="/src/assets/images/services/videoke.png">Videoke</option>
              <option value="/src/assets/images/services/lifevest.png">Life Vest</option>
              <option value="/src/assets/images/services/swimming.png">Swimming Pool Pass</option>
              <option value="/src/assets/images/services/floating.png">Kayak / Floating</option>
              <option value="/src/assets/images/services/tent.png">Camping Tent</option>
              <option value="/src/assets/images/services/room.png">Guest Room</option>
              <option value="/src/assets/images/services/event.png">Event Pavilion</option>
              <option value="/src/assets/images/services/buffet.png">Buffet & Catering</option>
              <option value="/src/assets/images/services/parking.png">Vehicle Parking</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700">Description</label>
          <textarea required value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Service specifications and capacity details" rows={2} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700">Price (₱)</label>
            <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-mono mt-1" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700">Unit</label>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="day / head" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs mt-1" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700">Max Capacity</label>
            <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-mono mt-1" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all mt-2">
          {loading ? 'Saving Service...' : 'Save Service'}
        </button>
      </form>
    </div>
  );
}