import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Tag, Clock, Eye, Edit2, Trash2, Filter, X, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import { useAuth } from '../contexts/AuthContext';
import CreateProductModal from './modals/CreateProductModal';
import ViewProductModal from './modals/ViewProductModal';
import EditProductModal from './modals/EditProductModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { PRODUCT_STATUS_COLORS, PRODUCT_STATUS_LABELS } from '../types/product';

const Products: React.FC = () => {
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'superadmin';
  const isViewer = userProfile?.role === 'viewer';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // États des filtres
  const [filters, setFilters] = useState({
    status: [] as Product['status'][],
    priority: [] as ('low' | 'medium' | 'high')[],
    complexity: [] as ('low' | 'medium' | 'high')[],
    category: [] as string[],
    client: [] as string[],
    dateRange: {
      start: '',
      end: ''
    },
    teamSize: {
      min: '',
      max: ''
    },
    budget: {
      min: '',
      max: ''
    },
    technologies: [] as string[],
    tags: [] as string[]
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.metadata?.client?.toLowerCase().includes(query) ||
        product.metadata?.technologies?.some(tech => tech.toLowerCase().includes(query)) ||
        product.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtres de statut
    if (filters.status.length > 0) {
      filtered = filtered.filter(product => filters.status.includes(product.status));
    }

    // Filtres de priorité
    if (filters.priority.length > 0) {
      filtered = filtered.filter(product => 
        product.metadata?.priority && filters.priority.includes(product.metadata.priority)
      );
    }

    // Filtres de complexité
    if (filters.complexity.length > 0) {
      filtered = filtered.filter(product => 
        product.metadata?.complexity && filters.complexity.includes(product.metadata.complexity)
      );
    }

    // Filtres de catégorie
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => 
        product.category && filters.category.includes(product.category)
      );
    }

    // Filtres de client
    if (filters.client.length > 0) {
      filtered = filtered.filter(product => 
        product.metadata?.client && filters.client.includes(product.metadata.client)
      );
    }

    // Filtre de date
    if (filters.dateRange.start) {
      filtered = filtered.filter(product => 
        new Date(product.startDate.toDate()) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(product => 
        new Date(product.startDate.toDate()) <= new Date(filters.dateRange.end)
      );
    }

    // Filtre de taille d'équipe
    if (filters.teamSize.min) {
      filtered = filtered.filter(product => 
        product.metadata?.teamSize && product.metadata.teamSize >= parseInt(filters.teamSize.min)
      );
    }
    if (filters.teamSize.max) {
      filtered = filtered.filter(product => 
        product.metadata?.teamSize && product.metadata.teamSize <= parseInt(filters.teamSize.max)
      );
    }

    // Filtre de budget
    if (filters.budget.min) {
      filtered = filtered.filter(product => 
        product.metadata?.budget?.allocated && 
        product.metadata.budget.allocated >= parseInt(filters.budget.min)
      );
    }
    if (filters.budget.max) {
      filtered = filtered.filter(product => 
        product.metadata?.budget?.allocated && 
        product.metadata.budget.allocated <= parseInt(filters.budget.max)
      );
    }

    // Filtres de technologies
    if (filters.technologies.length > 0) {
      filtered = filtered.filter(product => 
        product.metadata?.technologies?.some(tech => 
          filters.technologies.includes(tech)
        )
      );
    }

    // Filtres de tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(product => 
        product.metadata?.tags?.some(tag => 
          filters.tags.includes(tag)
        )
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      setLoading(true);
      await productService.updateProduct(productId, productData);
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, ...productData } : product
      ));
      setEditProduct(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      setLoading(true);
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (type: keyof typeof filters, value: any) => {
    setFilters(prev => {
      if (Array.isArray(prev[type])) {
        const array = prev[type] as any[];
        return {
          ...prev,
          [type]: array.includes(value)
            ? array.filter(item => item !== value)
            : [...array, value]
        };
      }
      return prev;
    });
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      priority: [],
      complexity: [],
      category: [],
      client: [],
      dateRange: { start: '', end: '' },
      teamSize: { min: '', max: '' },
      budget: { min: '', max: '' },
      technologies: [],
      tags: []
    });
    setSearchQuery('');
  };

  // Extraire les valeurs uniques pour les filtres
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const uniqueClients = Array.from(new Set(products.map(p => p.metadata?.client).filter(Boolean)));
  const uniqueTechnologies = Array.from(new Set(products.flatMap(p => p.metadata?.technologies || [])));
  const uniqueTags = Array.from(new Set(products.flatMap(p => p.metadata?.tags || [])));

  if (loading && !products.length) {
    return <LoadingState message="Chargement des projets..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadProducts} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-eyone-blue to-eyone-blue/80 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Projets</h2>
              <p className="text-blue-100">Gérez vos projets et leur avancement</p>
            </div>
          </div>
          {!isViewer && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-white text-eyone-blue px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau projet
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Total</div>
            <div className="text-3xl font-bold">{products.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">En cours</div>
            <div className="text-3xl font-bold">
              {products.filter(p => p.status === 'in_development').length}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Déployés</div>
            <div className="text-3xl font-bold">
              {products.filter(p => p.status === 'deployed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un projet..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="mt-4 p-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">Filtres avancés</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Réinitialiser les filtres
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <div className="space-y-2">
                  {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(value as Product['status'])}
                        onChange={() => toggleFilter('status', value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes('high')}
                      onChange={() => toggleFilter('priority', 'high')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Haute</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes('medium')}
                      onChange={() => toggleFilter('priority', 'medium')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Moyenne</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes('low')}
                      onChange={() => toggleFilter('priority', 'low')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Basse</span>
                  </label>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (€)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.budget.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        budget: { ...prev.budget, min: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.budget.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        budget: { ...prev.budget, max: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Début</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fin</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Technologies */}
              {uniqueTechnologies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technologies
                  </label>
                  <div className="space-y-2">
                    {uniqueTechnologies.map((tech) => (
                      <label key={tech} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.technologies.includes(tech)}
                          onChange={() => toggleFilter('technologies', tech)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tech}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {uniqueTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    {uniqueTags.map((tag) => (
                      <label key={tag} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={() => toggleFilter('tags', tag)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Liste des projets */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun projet ne correspond aux critères de recherche</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {product.metadata?.budget?.allocated?.toLocaleString() || 0}€
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Mis à jour le {product.updatedAt.toDate().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        PRODUCT_STATUS_COLORS[product.status]?.bg || 'bg-gray-100'
                      } ${PRODUCT_STATUS_COLORS[product.status]?.text || 'text-gray-800'}`}>
                        {PRODUCT_STATUS_LABELS[product.status]}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setViewProduct(product)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-lg"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isViewer && (
                          <button
                            onClick={() => setEditProduct(product)}
                            className="p-1 text-gray-400 hover:text-green-600 rounded-lg"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                            title="Supprimer"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <CreateProductModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateProduct}
          loading={loading}
        />
      )}

      {viewProduct && (
        <ViewProductModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}

      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSubmit={handleEditProduct}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Products;