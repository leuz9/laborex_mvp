import React, { useState } from 'react';
import { Star, Search, Filter, Calendar, User, Clock, MessageSquare, Package } from 'lucide-react';
import { usePharmacyRatings } from '../../hooks/usePharmacyRatings';

interface Props {
  pharmacyId: string;
}

export default function RatingsView({ pharmacyId }: Props) {
  const { ratings, averageRating, totalRatings } = usePharmacyRatings(pharmacyId);
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Filtrer les notes selon la période
  const getStartDate = () => {
    if (period === 'all') return new Date(0);
    
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
    }
  };

  const filteredRatings = ratings
    .filter(rating => {
      const afterStartDate = new Date(rating.createdAt) >= getStartDate();
      const matchesRating = filterRating === 'all' || rating.rating === filterRating;
      return afterStartDate && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.rating - a.rating;
      }
    });

  // Calculer les statistiques pour la période filtrée
  const periodStats = {
    average: filteredRatings.reduce((sum, r) => sum + r.rating, 0) / filteredRatings.length || 0,
    total: filteredRatings.length,
    distribution: {
      5: filteredRatings.filter(r => r.rating === 5).length,
      4: filteredRatings.filter(r => r.rating === 4).length,
      3: filteredRatings.filter(r => r.rating === 3).length,
      2: filteredRatings.filter(r => r.rating === 2).length,
      1: filteredRatings.filter(r => r.rating === 1).length,
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">
                  {averageRating.toFixed(1)}
                </span>
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Sur {totalRatings} avis
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Note période actuelle</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">
                  {periodStats.average.toFixed(1)}
                </span>
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Sur {periodStats.total} avis
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-3">Distribution des notes</p>
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center mb-1">
              <div className="flex items-center w-16">
                <span className="text-sm mr-1">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{
                    width: `${(periodStats.distribution[rating] / periodStats.total) * 100}%`
                  }}
                />
              </div>
              <span className="text-sm text-gray-500 ml-2 w-12">
                {periodStats.distribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex space-x-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year' | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les périodes</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les notes</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>{rating} étoiles</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Trier par date</option>
              <option value="rating">Trier par note</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {filteredRatings.map((rating) => (
          <div key={rating.orderId} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= rating.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {rating.rating}/5
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(rating.createdAt).toLocaleString()}
              </div>
            </div>

            {rating.comment && (
              <div className="mb-4">
                <p className="text-gray-700">{rating.comment}</p>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-500">
              <Package className="w-4 h-4 mr-1" />
              <span>Commande #{rating.orderId.slice(0, 8)}</span>
            </div>
          </div>
        ))}

        {filteredRatings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Pas d'avis</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun avis ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}