import React, { useState } from 'react';
import { Star, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

interface Props {
  orderId: string;
  pharmacyId: string;
  onClose: () => void;
}

export default function RatingModal({ orderId, pharmacyId, onClose }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Mettre à jour la commande avec la note
      await updateDoc(doc(db, 'orders', orderId), {
        rating,
        comment,
        ratedAt: new Date().toISOString()
      });

      // Ajouter la note à la pharmacie
      await updateDoc(doc(db, 'users', pharmacyId), {
        ratings: arrayUnion({
          orderId,
          userId: user.id,
          rating,
          comment,
          createdAt: new Date().toISOString()
        })
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Une erreur est survenue lors de l\'envoi de votre note');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Merci pour votre avis !
          </h3>
          <p className="text-sm text-gray-500">
            Votre note nous aide à améliorer notre service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">Noter la pharmacie</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre note
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        value <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Partagez votre expérience..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className={`flex items-center px-4 py-2 rounded-lg text-white ${
                  loading || rating === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}