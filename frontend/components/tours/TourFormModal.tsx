'use client';

import { useState, useEffect } from 'react';
import { Tour } from '@/types';
import { tourService } from '@/services/tour.service';

export default function TourFormModal({
  tour,
  onClose,
  onSave
}: {
  tour?: Tour | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(tour?.name || '');
  const [duration, setDuration] = useState(tour?.duration || 0);
  const [maxGroupSize, setMaxGroupSize] = useState(tour?.maxGroupSize || 0);
  const [difficulty, setDifficulty] = useState(tour?.difficulty || 'medium');
  const [price, setPrice] = useState(tour?.price || 0);
  const [summary, setSummary] = useState(tour?.summary || '');
  const [description, setDescription] = useState(tour?.description || '');
  
  const [startLocationDesc, setStartLocationDesc] = useState(tour?.startLocation?.description || '');
  const [startLocationLng, setStartLocationLng] = useState(tour?.startLocation?.coordinates?.[0] || 0);
  const [startLocationLat, setStartLocationLat] = useState(tour?.startLocation?.coordinates?.[1] || 0);

  const [imageCover, setImageCover] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('duration', String(duration));
      formData.append('maxGroupSize', String(maxGroupSize));
      formData.append('difficulty', difficulty);
      formData.append('price', String(price));
      formData.append('summary', summary);
      formData.append('description', description);
      
      formData.append('startLocation', JSON.stringify({
        type: 'Point',
        description: startLocationDesc,
        coordinates: [Number(startLocationLng), Number(startLocationLat)]
      }));

      if (imageCover) {
        formData.append('imageCover', imageCover);
      }
      
      if (images) {
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }
      }

      if (tour?._id) {
        await tourService.updateTour(tour._id, formData);
      } else {
        await tourService.createTour(formData);
      }
      
      onSave();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the tour.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{tour ? 'Edit Tour' : 'Create New Tour'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
              <input type="number" required value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Group Size</label>
              <input type="number" required value={maxGroupSize} onChange={(e) => setMaxGroupSize(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full px-3 py-2 border rounded-md capitalize">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <input type="text" required value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md"></textarea>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
              <input type="text" required value={startLocationDesc} onChange={(e) => setStartLocationDesc(e.target.value)} placeholder="E.g. Miami, USA" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" required value={startLocationLng} onChange={(e) => setStartLocationLng(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" required value={startLocationLat} onChange={(e) => setStartLocationLat(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Cover (required)</label>
              <input type="file" accept="image/*" onChange={(e) => setImageCover(e.target.files ? e.target.files[0] : null)} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (multiple)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files)} className="w-full text-sm" />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
