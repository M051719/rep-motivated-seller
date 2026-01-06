import React, { useState } from 'react';
import { Wrench, Plus, Trash2, Calculator } from 'lucide-react';

interface RepairItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitCost: number;
}

export const RepairEstimator: React.FC = () => {
  const [items, setItems] = useState<RepairItem[]>([
    { id: '1', category: 'Kitchen', description: '', quantity: 1, unitCost: 0 },
  ]);

  const categories = [
    'Kitchen',
    'Bathroom',
    'Flooring',
    'Paint/Drywall',
    'Roofing',
    'HVAC',
    'Plumbing',
    'Electrical',
    'Windows/Doors',
    'Landscaping',
    'Other',
  ];

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        category: 'Kitchen',
        description: '',
        quantity: 1,
        unitCost: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof RepairItem, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateItemTotal = (item: RepairItem) => {
    return item.quantity * item.unitCost;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateCategoryTotal = (category: string) => {
    return items
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const getCategoryItems = (category: string) => {
    return items.filter((item) => item.category === category);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Wrench className="w-8 h-8 text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            Repair Cost Estimator
          </h2>
        </div>
        <button
          onClick={addItem}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryItems = getCategoryItems(category);
          const categoryTotal = calculateCategoryTotal(category);

          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{category}</h3>
                <div className="text-lg font-semibold text-blue-600">
                  ${categoryTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <input
                      type="number"
                      placeholder="Unit Cost"
                      value={item.unitCost || ''}
                      onChange={(e) => updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <div className="col-span-1 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Total Estimate</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
            <div className="text-2xl font-bold text-blue-600">
              ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">+ Contingency (10%)</div>
            <div className="text-2xl font-bold text-orange-600">
              ${(calculateTotal() * 0.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Total with Contingency</div>
            <div className="text-2xl font-bold text-green-600">
              ${(calculateTotal() * 1.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          💡 Tip: Always add 10-20% contingency for unexpected repairs
        </div>
      </div>
    </div>
  );
};
