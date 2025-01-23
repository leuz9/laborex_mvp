import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertTriangle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const DOMAIN = '@eyone.net';
  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!emailPrefix.trim()) {
      setError('Veuillez entrer un nom d\'utilisateur');
      setLoading(false);
      return;
    }

    const email = emailPrefix + DOMAIN;

    try {
      await signIn(email, password);
      const from = (location.state as any)?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau de gauche - Animation galactique */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-eyone-blue via-indigo-900 to-black relative overflow-hidden">
        {/* Étoiles scintillantes */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDuration: Math.random() * 3 + 1 + 's',
                animationDelay: Math.random() * 2 + 's'
              }}
            />
          ))}
        </div>

        {/* Nébuleuses animées */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"
               style={{ top: '20%', left: '10%' }} />
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"
               style={{ top: '50%', right: '10%', animationDelay: '1s' }} />
          <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow"
               style={{ bottom: '10%', left: '30%', animationDelay: '2s' }} />
        </div>

        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/30 rounded-full animate-float"
              style={{
                width: Math.random() * 5 + 'px',
                height: Math.random() * 5 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `float ${Math.random() * 10 + 5}s linear infinite`,
                animationDelay: `-${Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Contenu */}
        <div className="relative flex flex-col items-center justify-center w-full p-12 text-white z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <img 
              src="https://cdn1.vc4a.com/media/2017/06/eyone-logo.png"
              alt="Eyone Logo"
              className="w-32 h-32 mb-8 object-contain relative z-10"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white animate-pulse">
              Bienvenue
            </span>
          </h1>
          <p className="text-xl text-blue-100 text-center relative z-10">
            Connectez-vous pour accéder à votre espace de travail.
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
              Connexion
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ou{' '}
              <Link to="/signup" className="font-medium text-eyone-blue hover:text-eyone-blue/80">
                créez un nouveau compte
              </Link>
            </p>
          </div>

          {/* Message de succès après inscription */}
          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2 text-green-800">
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-eyone-gray-dark">
                  Adresse email
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email-prefix"
                      name="email-prefix"
                      type="text"
                      required
                      value={emailPrefix}
                      onChange={(e) => setEmailPrefix(e.target.value)}
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-eyone-blue focus:border-eyone-blue sm:text-sm"
                      placeholder="nom.prenom"
                    />
                  </div>
                  <span className="inline-flex items-center px-3 py-2 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {DOMAIN}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-eyone-gray-dark">
                  Mot de passe
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-eyone-blue focus:border-eyone-blue sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-eyone-blue focus:ring-eyone-blue border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-eyone-gray-dark">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-eyone-blue hover:text-eyone-blue/80"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-eyone-orange hover:bg-eyone-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eyone-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-5 w-5 text-eyone-orange/50 group-hover:text-eyone-orange/40" />
                </span>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;