import React, { useState } from 'react';
import { X, Calendar, Package, Tag, Info, Code, Users, GitBranch } from 'lucide-react';
import type { Product } from '../../types/product';
import { 
  PRODUCT_STATUS_LABELS, 
  PRODUCT_STATUS_DESCRIPTIONS,
  COMPLEXITY_LABELS,
  PRIORITY_LABELS 
} from '../../types/product';

interface CreateProductModalProps {
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loading?: boolean;
}

const DEFAULT_PRODUCT_IMAGE = 'https://cdn3d.iconscout.com/3d/premium/thumb/product-3d-icon-download-in-png-blend-fbx-gltf-file-formats--tag-packages-box-marketing-advertisement-pack-branding-icons-4863042.png';

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    status: 'draft' as Product['status'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    metadata: {
      repository: '',
      technologies: [] as string[],
      teamSize: 1,
      complexity: 'medium' as 'low' | 'medium' | 'high',
      priority: 'medium' as 'low' | 'medium' | 'high',
      deliverables: [] as string[],
      dependencies: [] as string[],
      environments: {
        dev: '',
        staging: '',
        prod: ''
      },
      tags: [] as string[],
      client: '',
      budget: {
        allocated: 0,
        spent: 0,
        currency: 'EUR'
      }
    }
  });

  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [newTechnology, setNewTechnology] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date(formData.startDate);
    const endDate = formData.endDate ? new Date(formData.endDate) : null;

    if (endDate && startDate > endDate) {
      alert('La date de fin doit être postérieure à la date de début');
      return;
    }

    try {
      const productData = {
        ...formData,
        imageUrl: formData.imageUrl || DEFAULT_PRODUCT_IMAGE,
        startDate,
        endDate
      };
      await onSubmit(productData);
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Erreur lors de la création du projet');
    }
  };

  const handleAddItem = (field: 'technologies' | 'deliverables' | 'dependencies' | 'tags', value: string) => {
    if (value.trim() && !formData.metadata[field].includes(value.trim())) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          [field]: [...formData.metadata[field], value.trim()]
        }
      });
    }
  };

  const handleRemoveItem = (field: 'technologies' | 'deliverables' | 'dependencies' | 'tags', item: string) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [field]: formData.metadata[field].filter(i => i !== item)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nouveau projet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image du projet
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du projet
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Informations projet */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                value={formData.metadata.client}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, client: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Web, Mobile, API..."
              />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget alloué
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  min="0"
                  value={formData.metadata.budget.allocated}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      budget: {
                        ...formData.metadata.budget,
                        allocated: parseFloat(e.target.value)
                      }
                    }
                  })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taille de l'équipe
              </label>
              <input
                type="number"
                min="1"
                value={formData.metadata.teamSize}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, teamSize: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Repository et Environnements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Repository
              </div>
            </label>
            <input
              type="url"
              value={formData.metadata.repository}
              onChange={(e) => setFormData({
                ...formData,
                metadata: { ...formData.metadata, repository: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/organisation/projet"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Dev
              </label>
              <input
                type="url"
                value={formData.metadata.environments.dev}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: {
                    ...formData.metadata,
                    environments: { ...formData.metadata.environments, dev: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Staging
              </label>
              <input
                type="url"
                value={formData.metadata.environments.staging}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: {
                    ...formData.metadata,
                    environments: { ...formData.metadata.environments, staging: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Production
              </label>
              <input
                type="url"
                value={formData.metadata.environments.prod}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: {
                    ...formData.metadata,
                    environments: { ...formData.metadata.environments, prod: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Technologies
              </div>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('technologies', newTechnology), setNewTechnology(''))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: React, Node.js, TypeScript..."
              />
              <button
                type="button"
                onClick={() => {
                  handleAddItem('technologies', newTechnology);
                  setNewTechnology('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.metadata.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('technologies', tech)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Livrables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Livrables
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('deliverables', newDeliverable), setNewDeliverable(''))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: API Documentation, Mobile App, Admin Dashboard..."
              />
              <button
                type="button"
                onClick={() => {
                  handleAddItem('deliverables', newDeliverable);
                  setNewDeliverable('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.metadata.deliverables.map((deliverable, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {deliverable}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('deliverables', deliverable)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Statut et Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <button
                  type="button"
                  onClick={() => setShowStatusInfo(!showStatusInfo)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {showStatusInfo && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Description des statuts</h4>
                  <div className="space-y-2">
                    {Object.entries(PRODUCT_STATUS_DESCRIPTIONS).map(([status, description]) => (
                      <div key={status} className="text-sm">
                        <span className="font-medium">{PRODUCT_STATUS_LABELS[status as Product['status']]}:</span>{' '}
                        {description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                value={formData.metadata.priority}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, priority: e.target.value as 'low' | 'medium' | 'high' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de début
                </div>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de fin (optionnelle)
                </div>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('tags', newTag), setNewTag(''))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={() => {
                  handleAddItem('tags', newTag);
                  setNewTag('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('tags', tag)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;