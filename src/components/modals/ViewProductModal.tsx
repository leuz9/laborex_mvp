import React from 'react';
import { X, Tag, Calendar, Package, Clock, DollarSign } from 'lucide-react';
import type { Product } from '../../types/product';

interface ViewProductModalProps {
  product: Product;
  onClose: () => void;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails du produit</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {product.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-48 h-48 rounded-lg object-cover"
                />
              </div>
            )}

            <div>
              <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Budget alloué</div>
                  <div className="font-medium">{product.metadata?.budget?.allocated?.toLocaleString() || 0}€</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Statut</div>
                  <div className="font-medium capitalize">{product.status}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Date de début</div>
                  <div className="font-medium">
                    {product.startDate.toDate().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {product.endDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Date de fin</div>
                    <div className="font-medium">
                      {product.endDate.toDate().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {product.category && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Catégorie</div>
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                  {product.category}
                </div>
              </div>
            )}

            {/* Informations supplémentaires */}
            {product.metadata && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {product.metadata.client && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Client</div>
                    <div className="font-medium">{product.metadata.client}</div>
                  </div>
                )}

                {product.metadata.technologies && product.metadata.technologies.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Technologies</div>
                    <div className="flex flex-wrap gap-2">
                      {product.metadata.technologies.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.metadata.teamSize && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Taille de l'équipe</div>
                    <div className="font-medium">{product.metadata.teamSize} membres</div>
                  </div>
                )}

                {product.metadata.tags && product.metadata.tags.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {product.metadata.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  Dernière mise à jour le {product.updatedAt.toDate().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;