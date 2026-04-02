'use client';

import React, { useState } from 'react';
import type { SavedRestaurant, MenuItem, MenuCategory, DietaryTag } from '@/types/restaurant';
import { MENU_CATEGORIES, DIETARY_TAGS } from '@/types/restaurant';

interface RestaurantBuilderProps {
  savedRestaurants: SavedRestaurant[];
  onSave: (restaurant: SavedRestaurant) => void;
  onRemove: (restaurantId: string) => void;
  onUpdate: (restaurant: SavedRestaurant) => void;
}

export const RestaurantBuilder: React.FC<RestaurantBuilderProps> = ({
  savedRestaurants,
  onSave,
  onRemove,
  onUpdate,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('Appetizers');

  // New Restaurant State
  const [newRestName, setNewRestName] = useState('');
  const [newRestCuisine, setNewRestCuisine] = useState('');
  const [newRestLocation, setNewRestLocation] = useState('');

  // New Menu Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number | ''>('');
  const [newItemCategory, setNewItemCategory] = useState<MenuCategory>('Mains');
  const [newItemTags, setNewItemTags] = useState<DietaryTag[]>([]);

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName.trim() || !newRestCuisine.trim()) return;

    const newRestaurant: SavedRestaurant = {
      id: `rest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: newRestName.trim(),
      cuisine: newRestCuisine.trim(),
      location: newRestLocation.trim() || undefined,
      menuItems: [],
      source: 'manual',
      addedAt: new Date().toISOString(),
    };

    onSave(newRestaurant);
    setNewRestName('');
    setNewRestCuisine('');
    setNewRestLocation('');
    setShowCreateForm(false);
    setEditingRestaurantId(newRestaurant.id);
  };

  const handleAddMenuItem = (restaurantId: string) => {
    if (!newItemName.trim()) return;
    const restaurant = savedRestaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;

    const newItem: MenuItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: newItemName.trim(),
      description: newItemDesc.trim() || undefined,
      price: typeof newItemPrice === 'number' ? newItemPrice : undefined,
      category: newItemCategory,
      dietaryTags: [...newItemTags],
    };

    onUpdate({ ...restaurant, menuItems: [...(restaurant.menuItems || []), newItem] });
    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('');
    setNewItemTags([]);
  };

  const handleRemoveMenuItem = (restaurantId: string, itemId: string) => {
    const restaurant = savedRestaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;
    onUpdate({ ...restaurant, menuItems: (restaurant.menuItems || []).filter(i => i.id !== itemId) });
  };

  const toggleTag = (tag: DietaryTag) => {
    setNewItemTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getCategoryCount = (items: MenuItem[], cat: MenuCategory) =>
    items.filter(i => i.category === cat).length;

  return (
    <div className="space-y-6">
      {/* Create New Restaurant CTA */}
      {!showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full py-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-700 font-medium hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
          <span>Create New Restaurant Menu</span>
        </button>
      )}

      {/* Create New Restaurant Form */}
      {showCreateForm && (
        <div className="bg-gradient-to-br from-purple-50 to-orange-50 p-5 rounded-xl border border-purple-200 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-bold text-purple-800 flex items-center gap-2">
              <span>🍽️</span> New Restaurant
            </h4>
            <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
          <form onSubmit={handleCreateRestaurant} className="space-y-4">
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className="block text-xs font-semibold text-purple-700 mb-1.5 uppercase tracking-wide">Restaurant Name *</label>
              <input
                type="text" value={newRestName} onChange={(e) => setNewRestName(e.target.value)} required
                className="w-full px-4 py-2.5 bg-white border border-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm shadow-sm"
                placeholder="e.g. Alchemical Kitchen"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-xs font-semibold text-purple-700 mb-1.5 uppercase tracking-wide">Cuisine Style *</label>
                <input
                  type="text" value={newRestCuisine} onChange={(e) => setNewRestCuisine(e.target.value)} required
                  className="w-full px-4 py-2.5 bg-white border border-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm shadow-sm"
                  placeholder="e.g. Fusion, Italian, Vegan..."
                />
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block text-xs font-semibold text-purple-700 mb-1.5 uppercase tracking-wide">Location (Optional)</label>
                <input
                  type="text" value={newRestLocation} onChange={(e) => setNewRestLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm shadow-sm"
                  placeholder="e.g. Portland, OR"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:from-purple-700 hover:to-orange-600 transition-all"
            >
              Create Restaurant &amp; Build Menu
            </button>
          </form>
        </div>
      )}

      {/* Created Restaurants List */}
      {savedRestaurants.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span>📋</span> My Restaurant Menus ({savedRestaurants.length})
          </h4>

          {savedRestaurants.map((restaurant) => {
            const isEditing = editingRestaurantId === restaurant.id;
            const items = restaurant.menuItems || [];
            const totalItems = items.length;

            return (
              <div
                key={restaurant.id}
                className={`border rounded-xl shadow-sm overflow-hidden transition-all ${
                  isEditing ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                {/* Header */}
                <div
                  className={`p-4 cursor-pointer flex items-center justify-between ${isEditing ? 'bg-gradient-to-r from-purple-50 to-orange-50' : 'bg-white'}`}
                  onClick={() => {
                    if (isEditing) { setEditingRestaurantId(null); }
                    else {
                      setEditingRestaurantId(restaurant.id);
                      setActiveCategory('Appetizers');
                      setNewItemName(''); setNewItemDesc(''); setNewItemPrice(''); setNewItemTags([]);
                    }
                  }}
                >
                  <div>
                    <h5 className="font-bold text-gray-800 text-lg">{restaurant.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                      <span className="font-medium px-2 py-0.5 bg-purple-100 rounded text-purple-700">{restaurant.cuisine}</span>
                      {restaurant.location && <span>• {restaurant.location}</span>}
                      <span>• {totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                      {restaurant.source === 'foursquare' && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">Foursquare</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // eslint-disable-next-line no-alert
                        if (window.confirm(`Delete "${restaurant.name}" and its entire menu?`)) onRemove(restaurant.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full"
                      title="Delete"
                    >🗑️</button>
                    <div className={`transform transition-transform text-sm ${isEditing ? 'rotate-180 text-purple-600' : 'text-gray-400'}`}>▼</div>
                  </div>
                </div>

                {/* Menu Editor */}
                {isEditing && (
                  <div className="bg-white border-t border-purple-100">
                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-100 px-2 pt-2 gap-0.5">
                      {MENU_CATEGORIES.map(cat => {
                        const count = getCategoryCount(items, cat);
                        const isActive = activeCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                              isActive
                                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                            }`}
                          >
                            {cat}
                            {count > 0 && (
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>{count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-5">
                      {/* Items in Active Category */}
                      <div className="mb-6">
                        {items.filter(i => i.category === activeCategory).length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500">No {activeCategory.toLowerCase()} yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Add your first one below!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {items.filter(i => i.category === activeCategory).map(item => (
                              <div key={item.id} className="group flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                                <div className="pr-4 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h6 className="font-semibold text-gray-800 text-sm">{item.name}</h6>
                                    {item.dietaryTags && item.dietaryTags.map(tag => {
                                      const tagMeta = DIETARY_TAGS.find(t => t.key === tag);
                                      return tagMeta ? (
                                        <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${tagMeta.color}`} title={tagMeta.label}>
                                          {tagMeta.icon} {tag}
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  {item.price !== undefined && (
                                    <span className="font-semibold text-purple-700 text-sm tabular-nums">
                                      {item.price.toFixed(2)}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRemoveMenuItem(restaurant.id, item.id)}
                                    className="text-xs text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                  >Remove</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add Menu Item Form */}
                      <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 p-4 rounded-xl border border-gray-200">
                        <h6 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                          <span className="text-purple-600 text-base">+</span> Add Menu Item
                        </h6>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                              <input
                                type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Dish Name *"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                              />
                            </div>
                            <div>
                              <select
                                value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value as MenuCategory)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                              >
                                {MENU_CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <input
                                type="number" min="0" step="0.01" value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                placeholder="Price"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                              />
                            </div>
                          </div>

                          <textarea
                            value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)}
                            placeholder="A mouth-watering description... (Optional)"
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
                          />

                          {/* Dietary Tags */}
                          <div>
                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Dietary Tags</label>
                            <div className="flex flex-wrap gap-2">
                              {DIETARY_TAGS.map(tag => {
                                const isSelected = newItemTags.includes(tag.key);
                                return (
                                  <button
                                    key={tag.key}
                                    type="button"
                                    onClick={() => toggleTag(tag.key)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                      isSelected
                                        ? `${tag.color  } ring-2 ring-offset-1 ring-purple-300 shadow-sm`
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    {tag.icon} {tag.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddMenuItem(restaurant.id)}
                            disabled={!newItemName.trim()}
                            className="w-full py-2.5 bg-purple-600 text-white font-semibold text-sm rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                          >
                            Add to {newItemCategory}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
