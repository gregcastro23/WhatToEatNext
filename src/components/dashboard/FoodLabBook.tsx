'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────────── */

interface LabPhoto {
  dataUrl: string;
  caption?: string;
  uploadedAt: string;
}

interface FoodLabEntry {
  id: string;
  dishName: string;
  description?: string;
  notes?: string;
  recipeName?: string;
  cuisineType?: string;
  cookingMethod?: string;
  cookedAt: string;
  photos: LabPhoto[];
  elementalTags: Record<string, number>;
  alchemicalTags: Record<string, number>;
  rating?: number;
  tags: string[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ─────────────────────────────────────────── */

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'bg-orange-100 text-orange-700',
  Water: 'bg-blue-100 text-blue-700',
  Earth: 'bg-green-100 text-green-700',
  Air: 'bg-purple-100 text-purple-700',
};

const CUISINE_OPTIONS = [
  'Italian', 'Japanese', 'Mexican', 'Indian', 'French', 'Chinese',
  'Greek', 'Thai', 'American', 'Korean', 'Vietnamese', 'Middle-Eastern', 'Other',
];

const COOKING_METHOD_OPTIONS = [
  'Baking', 'Boiling', 'Braising', 'Fermenting', 'Frying', 'Grilling',
  'Raw', 'Roasting', 'Smoking', 'Steaming', 'Stewing', 'Sautéing', 'Other',
];

/* ─── Star Rating ────────────────────────────────────────── */

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value?: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-xl transition-transform ${
            readonly ? 'cursor-default' : 'hover:scale-110'
          } ${star <= (value ?? 0) ? 'text-yellow-400' : 'text-gray-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ─── Share Panel ────────────────────────────────────────── */

function SharePanel({ entry }: { entry: FoodLabEntry }) {
  const [copied, setCopied] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [localEntry, setLocalEntry] = useState(entry);

  const shareUrl =
    localEntry.shareToken
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/lab/share/${localEntry.shareToken}`
      : null;

  const enableSharing = async () => {
    setEnabling(true);
    try {
      const res = await fetch(`/api/food-lab/${localEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublic: true }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setLocalEntry(data.entry);
    } finally {
      setEnabling(false);
    }
  };

  const copyLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const twitterText = encodeURIComponent(
    `Just cooked ${localEntry.dishName}! ${localEntry.cuisineType ? `${localEntry.cuisineType} cuisine` : ''} ${
      localEntry.rating ? `⭐️${'★'.repeat(localEntry.rating)}` : ''
    } — created with WhatToEatNext #AlchemicalCooking #Astro${localEntry.dishName.replace(/\s/g, '')}`,
  );
  const twitterUrl = shareUrl ? encodeURIComponent(shareUrl) : '';

  const instagramCaption = `${localEntry.dishName}${localEntry.cuisineType ? ` • ${localEntry.cuisineType}` : ''}${localEntry.cookingMethod ? ` • ${localEntry.cookingMethod}` : ''}\n\n${
    localEntry.notes ? `${localEntry.notes}\n\n` : ''
  }${localEntry.rating ? `${'⭐'.repeat(localEntry.rating)} Rating\n\n` : ''}${
    localEntry.tags.length > 0 ? `${localEntry.tags.map((t) => `#${t.replace(/\s/g, '')}`).join(' ')  }\n` : ''
  }#WhatToEatNext #AlchemicalCooking #${(localEntry.cookingMethod ?? 'Cooking').replace(/\s/g, '')}`;

  const [igCopied, setIgCopied] = useState(false);
  const copyIgCaption = () => {
    void navigator.clipboard.writeText(instagramCaption).then(() => {
      setIgCopied(true);
      setTimeout(() => setIgCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-800">Share Your Creation</h4>

      {!localEntry.isPublic ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-3">
            Make this entry public to generate a shareable link.
          </p>
          <button
            onClick={() => { void enableSharing(); }}
            disabled={enabling}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {enabling ? 'Enabling…' : 'Make Public & Get Link'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Share link */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl ?? ''}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 truncate"
            />
            <button
              onClick={copyLink}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Twitter/X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${twitterText}${twitterUrl ? `&url=${twitterUrl}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            Share on X (Twitter)
          </a>

          {/* Instagram caption */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Instagram Caption</span>
              <button
                onClick={copyIgCaption}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  igCopied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {igCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
              {instagramCaption}
            </pre>
          </div>

          {/* WhatsApp */}
          {shareUrl && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out my cooking: ${localEntry.dishName} — ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Entry Card ─────────────────────────────────────────── */

function EntryCard({
  entry,
  onClick,
}: {
  entry: FoodLabEntry;
  onClick: () => void;
}) {
  const cover = entry.photos[0]?.dataUrl;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
    >
      {/* Photo */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={entry.dishName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            🍽️
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-1">
            {entry.dishName}
          </h4>
          {entry.rating && (
            <span className="text-xs text-yellow-500 shrink-0">
              {'★'.repeat(entry.rating)}
            </span>
          )}
        </div>
        {entry.cuisineType && (
          <p className="text-xs text-gray-400 mt-0.5">{entry.cuisineType}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {Object.keys(entry.elementalTags).slice(0, 2).map((el) => (
            <span
              key={el}
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                ELEMENT_COLORS[el] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {el}
            </span>
          ))}
          {entry.tags.slice(0, 1).map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(entry.cookedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

/* ─── Entry Detail Modal ─────────────────────────────────── */

function EntryDetail({
  entry,
  onClose,
  onDeleted,
}: {
  entry: FoodLabEntry;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${entry.dishName}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/food-lab/${entry.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      onDeleted(entry.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 line-clamp-1">{entry.dishName}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Photos */}
          {entry.photos.length > 0 && (
            <div>
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={entry.photos[activePhoto].dataUrl}
                  alt={entry.dishName}
                  className="w-full h-full object-cover"
                />
              </div>
              {entry.photos.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {entry.photos.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === activePhoto ? 'border-purple-500' : 'border-transparent'
                      }`}
                    >
                      <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {entry.cuisineType && (
              <div>
                <span className="text-xs text-gray-500">Cuisine</span>
                <p className="font-medium text-gray-800">{entry.cuisineType}</p>
              </div>
            )}
            {entry.cookingMethod && (
              <div>
                <span className="text-xs text-gray-500">Method</span>
                <p className="font-medium text-gray-800">{entry.cookingMethod}</p>
              </div>
            )}
            {entry.recipeName && (
              <div>
                <span className="text-xs text-gray-500">Recipe</span>
                <p className="font-medium text-gray-800">{entry.recipeName}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500">Cooked</span>
              <p className="font-medium text-gray-800">
                {new Date(entry.cookedAt).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Rating */}
          {entry.rating && (
            <div>
              <span className="text-xs text-gray-500">Your rating</span>
              <div className="mt-1">
                <StarRating value={entry.rating} readonly />
              </div>
            </div>
          )}

          {/* Description + Notes */}
          {entry.description && (
            <div>
              <span className="text-xs text-gray-500">Description</span>
              <p className="text-sm text-gray-700 mt-1">{entry.description}</p>
            </div>
          )}
          {entry.notes && (
            <div>
              <span className="text-xs text-gray-500">Lab Notes</span>
              <div className="mt-1 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {entry.notes}
              </div>
            </div>
          )}

          {/* Elemental tags */}
          {Object.keys(entry.elementalTags).length > 0 && (
            <div>
              <span className="text-xs text-gray-500">Elemental Properties</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {Object.entries(entry.elementalTags).map(([el, v]) => (
                  <span
                    key={el}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      ELEMENT_COLORS[el] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {el}: {Math.round((v) * 100)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {entry.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share section */}
          {showShare && (
            <div className="border border-gray-200 rounded-xl p-4">
              <SharePanel entry={entry} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              {showShare ? 'Hide Share' : 'Share'}
            </button>
            <button
              onClick={() => { void handleDelete(); }}
              disabled={deleting}
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-60 transition-colors"
            >
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── New Entry Form ─────────────────────────────────────── */

function NewEntryForm({
  onSaved,
  onCancel,
}: {
  onSaved: (entry: FoodLabEntry) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    dishName: '',
    description: '',
    notes: '',
    recipeName: '',
    cuisineType: '',
    cookingMethod: '',
    cookedAt: new Date().toISOString().slice(0, 16),
    rating: 0,
    tags: '',
    isPublic: false,
    elementalTags: {} as Record<string, number>,
  });

  const [photos, setPhotos] = useState<LabPhoto[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/food-lab/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPhotos((prev) => [
        ...prev,
        { dataUrl: data.dataUrl, uploadedAt: data.uploadedAt },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const toggleElement = (el: string) => {
    setForm((prev) => {
      const tags = { ...prev.elementalTags };
      if (tags[el]) {
        delete tags[el];
      } else {
        tags[el] = 0.25;
      }
      return { ...prev, elementalTags: tags };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dishName.trim()) {
      setError('Dish name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/food-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          dishName: form.dishName.trim(),
          description: form.description || undefined,
          notes: form.notes || undefined,
          recipeName: form.recipeName || undefined,
          cuisineType: form.cuisineType || undefined,
          cookingMethod: form.cookingMethod || undefined,
          cookedAt: new Date(form.cookedAt).toISOString(),
          photos,
          elementalTags: form.elementalTags,
          rating: form.rating || undefined,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          isPublic: form.isPublic,
        }),
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSaved(data.entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">New Lab Entry</h3>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Photos */}
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-xs font-medium text-gray-600 mb-2">Photos</label>
          <div className="flex gap-2 flex-wrap">
            {photos.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black"
                >
                  ×
                </button>
              </div>
            ))}
            <label
              className={`w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                uploadingPhoto
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              {uploadingPhoto ? (
                <span className="text-xs text-purple-500 text-center px-1">Uploading…</span>
              ) : (
                <>
                  <span className="text-2xl text-gray-300">+</span>
                  <span className="text-xs text-gray-400">Photo</span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => { void handlePhotoUpload(e); }}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP up to 5 MB each</p>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="dishName" className="block text-xs text-gray-500 mb-1">Dish Name *</label>
            <input
              type="text"
              name="dishName"
              value={form.dishName}
              onChange={handleChange}
              placeholder="e.g. Saffron Risotto"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label htmlFor="cuisineType" className="block text-xs text-gray-500 mb-1">Cuisine</label>
            <select
              name="cuisineType"
              value={form.cuisineType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Select…</option>
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cookingMethod" className="block text-xs text-gray-500 mb-1">Cooking Method</label>
            <select
              name="cookingMethod"
              value={form.cookingMethod}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Select…</option>
              {COOKING_METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="recipeName" className="block text-xs text-gray-500 mb-1">Recipe Name</label>
            <input
              type="text"
              name="recipeName"
              value={form.recipeName}
              onChange={handleChange}
              placeholder="Optional recipe reference"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label htmlFor="cookedAt" className="block text-xs text-gray-500 mb-1">Cooked On</label>
            <input
              type="datetime-local"
              name="cookedAt"
              value={form.cookedAt}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs text-gray-500 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Brief description of the dish…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </div>

        {/* Lab Notes */}
        <div>
          <label htmlFor="notes" className="block text-xs text-gray-500 mb-1">Lab Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            placeholder="What worked? What would you change? Alchemical observations…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none font-mono"
          />
        </div>

        {/* Elemental tags */}
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-xs text-gray-500 mb-2">Elemental Properties (select all that apply)</label>
          <div className="flex gap-2 flex-wrap">
            {(['Fire', 'Water', 'Earth', 'Air'] as const).map((el) => (
              <button
                key={el}
                type="button"
                onClick={() => toggleElement(el)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.elementalTags[el] !== undefined
                    ? ELEMENT_COLORS[el]
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className="block text-xs text-gray-500 mb-2">Your Rating</label>
          <StarRating
            value={form.rating}
            onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-xs text-gray-500 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="e.g. spicy, weeknight, special-occasion"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Public toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="isPublic"
            checked={form.isPublic}
            onChange={handleChange}
            className="w-4 h-4 accent-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">
            Make this entry public (enables sharing link)
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save to Lab Book'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export const FoodLabBook: React.FC = () => {
  const [entries, setEntries] = useState<FoodLabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FoodLabEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/food-lab', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setEntries(data.entries ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleSaved = (entry: FoodLabEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setShowForm(false);
  };

  const handleDeleted = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Detail modal */}
      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800">Food Lab Book</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Document your culinary experiments, add photos, and share your creations.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + New Entry
            </button>
          )}
        </div>

        {entries.length > 0 && (
          <div className="flex gap-4 mt-4 text-center">
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="text-xl font-bold text-purple-700">{entries.length}</div>
              <div className="text-xs text-gray-500">Experiments</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="text-xl font-bold text-orange-600">
                {entries.reduce((acc, e) => acc + e.photos.length, 0)}
              </div>
              <div className="text-xs text-gray-500">Photos</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="text-xl font-bold text-green-600">
                {entries.filter((e) => e.isPublic).length}
              </div>
              <div className="text-xs text-gray-500">Shared</div>
            </div>
          </div>
        )}
      </div>

      {/* New entry form */}
      {showForm && (
        <NewEntryForm
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Entry grid */}
      {loading ? (
        <div className="text-center py-10 text-sm text-gray-400">
          Loading lab book…
        </div>
      ) : entries.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <div className="text-5xl mb-4">🧪</div>
          <h4 className="text-base font-semibold text-gray-700 mb-1">
            Your lab book is empty
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Document your first culinary experiment!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
