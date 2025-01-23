import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const SignUpForm: React.FC = () => {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const DOMAIN = '@eyone.net';

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const validatePassword = (password: string) => {
    const rules = [
      { test: /.{8,}/, message: 'Au moins 8 caractères' },
      { test: /[A-Z]/, message: 'Au moins une majuscule' },
      { test: /[a-z]/, message: 'Au moins une minuscule' },
      { test: /[0-9]/, message: 'Au moins un chiffre' },
      { test: /[^A-Za-z0-9]/, message: 'Au moins un caractère spécial' }
    ];

    const failedRules = rules.filter(rule => !rule.test.test(password));
    return failedRules;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const failedRules = validatePassword(password);
    if (failedRules.length > 0) {
      setError('Le mot de passe doit contenir : ' + failedRules.map(r => r.message).join(', '));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (!emailPrefix.trim()) {
      setError('Veuillez entrer un nom d\'utilisateur');
      setLoading(false);
      return;
    }

    const email = emailPrefix + DOMAIN;

    try {
      await signUp(email, password);
      navigate('/login', { 
        state: { 
          message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' 
        }
      });
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError('Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-prefix" className="sr-only">
                Adresse email
              </label>
              <div className="flex rounded-t-md">
                <input
                  id="email-prefix"
                  name="email-prefix"
                  type="text"
                  required
                  value={emailPrefix}
                  onChange={(e) => setEmailPrefix(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-tl-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="nom.prenom"
                />
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-100 text-gray-500 sm:text-sm">
                  {DOMAIN}
                </span>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  !passwordsMatch && confirmPassword 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Confirmer le mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!passwordsMatch && confirmPassword && (
            <p className="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Le mot de passe doit contenir :</h3>
            <ul className="space-y-2">
              {[
                { test: /.{8,}/, message: 'Au moins 8 caractères' },
                { test: /[A-Z]/, message: 'Au moins une majuscule' },
                { test: /[a-z]/, message: 'Au moins une minuscule' },
                { test: /[0-9]/, message: 'Au moins un chiffre' },
                { test: /[^A-Za-z0-9]/, message: 'Au moins un caractère spécial' }
              ].map((rule, index) => (
                <li 
                  key={index}
                  className={`flex items-center gap-2 text-sm ${
                    rule.test.test(password) ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    rule.test.test(password) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  {rule.message}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Création du compte...' : 'Créer un compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;