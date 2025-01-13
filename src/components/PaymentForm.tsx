import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';

interface Props {
  amount: number;
  onPaymentComplete: () => void;
}

export default function PaymentForm({ amount, onPaymentComplete }: Props) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success
    setProcessing(false);
    onPaymentComplete();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Paiement</h2>
      <div className="mb-4">
        <p className="text-lg font-medium">Total: {amount.toFixed(2)}€</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Numéro de carte
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              maxLength={19}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date d'expiration
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              maxLength={3}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={processing}
          className={`w-full py-3 px-4 rounded-lg text-white ${
            processing
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {processing ? 'Traitement en cours...' : 'Payer'}
        </button>
      </form>
    </div>
  );
}