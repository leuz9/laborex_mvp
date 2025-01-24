import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, ArrowUp, ArrowDown, Package, CreditCard, Smartphone, Banknote, ShoppingBag } from 'lucide-react';
import { usePharmacyOrders } from '../../hooks/usePharmacyOrders';

interface Props {
  pharmacyId: string;
}

interface PeriodStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentMethods: {
    card: number;
    mobile_money: number;
    cash: number;
  };
}

export default function FinanceView({ pharmacyId }: Props) {
  const { orders } = usePharmacyOrders(pharmacyId);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Calculer la date de début en fonction de la période
  const getStartDate = () => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
    }
  };

  // Filtrer les commandes pour la période sélectionnée
  const startDate = getStartDate();
  const filteredOrders = orders.filter(order => 
    new Date(order.createdAt) >= startDate && 
    order.status === 'completed'
  );

  // Calculer les statistiques
  const stats: PeriodStats = {
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalOrders: filteredOrders.length,
    averageOrderValue: filteredOrders.length > 0 
      ? Math.round(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0) / filteredOrders.length)
      : 0,
    paymentMethods: {
      card: filteredOrders.filter(order => order.paymentMethod === 'card').length,
      mobile_money: filteredOrders.filter(order => order.paymentMethod === 'mobile_money').length,
      cash: filteredOrders.filter(order => order.paymentMethod === 'cash').length,
    }
  };

  // Calculer les statistiques de la période précédente pour comparaison
  const getPreviousStartDate = () => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 14));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 2));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 2));
    }
  };

  const previousStartDate = getPreviousStartDate();
  const previousOrders = orders.filter(order => 
    new Date(order.createdAt) >= previousStartDate &&
    new Date(order.createdAt) < startDate &&
    order.status === 'completed'
  );

  const previousStats = {
    totalRevenue: previousOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalOrders: previousOrders.length
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revenueGrowth = getGrowthPercentage(stats.totalRevenue, previousStats.totalRevenue);
  const ordersGrowth = getGrowthPercentage(stats.totalOrders, previousStats.totalOrders);

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center space-x-4">
          <Calendar className="text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenus */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
              <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</p>
            </div>
            <div className={`flex items-center ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="ml-1">{Math.abs(revenueGrowth)}%</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>vs période précédente</span>
          </div>
        </div>

        {/* Commandes */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Commandes complétées</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className={`flex items-center ${ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {ordersGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="ml-1">{Math.abs(ordersGrowth)}%</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-1" />
            <span>vs période précédente</span>
          </div>
        </div>

        {/* Panier moyen */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Panier moyen</p>
              <p className="text-2xl font-bold">{stats.averageOrderValue.toLocaleString()} FCFA</p>
            </div>
            <TrendingUp className="text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <ShoppingBag className="w-4 h-4 mr-1" />
            <span>Par commande</span>
          </div>
        </div>
      </div>

      {/* Répartition des moyens de paiement */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium mb-4">Moyens de paiement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">Carte bancaire</span>
              </div>
              <span className="text-lg font-bold">{stats.paymentMethods.card}</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(stats.paymentMethods.card / stats.totalOrders) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-medium">Mobile Money</span>
              </div>
              <span className="text-lg font-bold">{stats.paymentMethods.mobile_money}</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{
                  width: `${(stats.paymentMethods.mobile_money / stats.totalOrders) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Banknote className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">Espèces</span>
              </div>
              <span className="text-lg font-bold">{stats.paymentMethods.cash}</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(stats.paymentMethods.cash / stats.totalOrders) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}