import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, AlertTriangle, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Un email de réinitialisation a été envoyé à votre adresse email');
    } catch (err) {
      console.error('Erreur de réinitialisation:', err);
      setError('Impossible de réinitialiser le mot de passe. Vérifiez votre adresse email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau de gauche - Image décorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-eyone-blue to-eyone-blue/80">
        <div className="flex flex-col items-center justify-center w-full p-12 text-white">
          <img 
            src="https://cdn1.vc4a.com/media/2017/06/eyone-logo.png"
            alt="Eyone Logo"
            className="w-32 h-32 mb-8 object-contain"
          />
          <h1 className="text-4xl font-bold mb-4">Mot de passe oublié ?</h1>
          <p className="text-xl text-blue-100 text-center">
            Pas de panique ! Nous allons vous aider à récupérer votre compte.
          </p>
        </div>
      </div>

      {/* Panneau de droite - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* En-tête */}
          <div>
            <div className="flex justify-center lg:hidden">
              <img 
                src="https://cdn1.vc4a.com/media/2017/06/eyone-logo.png"
                alt="Eyone Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-eyone-gray-dark">
              Réinitialisation du mot de passe
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Messages de succès/erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2 text-green-800">
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-eyone-gray-dark">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-eyone-blue focus:border-eyone-blue sm:text-sm"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-eyone-orange hover:bg-eyone-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eyone-orange disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-eyone-blue hover:text-eyone-blue/80"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;