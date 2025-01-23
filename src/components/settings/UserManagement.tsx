import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Edit2, Trash2, Lock, Users, X, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import type { UserProfile, UserRole } from '../../types/auth';
import { ROLE_PERMISSIONS } from '../../types/auth';
import LoadingState from '../LoadingState';
import ErrorState from '../ErrorState';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';

const UserManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'viewer' as UserRole,
    avatar: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as UserProfile[];
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
    if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule';
    if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un caractère spécial';
    return '';
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      setLoading(true);

      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const newUser: Omit<UserProfile, 'uid'> = {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        avatar: formData.avatar || DEFAULT_AVATAR,
        permissions: ROLE_PERMISSIONS[formData.role],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      };

      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      setUsers(prev => [...prev, { ...newUser, uid: userCredential.user.uid }]);
      setShowAddModal(false);
      setFormData({ email: '', password: '', displayName: '', role: 'viewer', avatar: '' });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', selectedUser.uid);
      const updates = {
        displayName: formData.displayName,
        role: formData.role,
        avatar: formData.avatar || selectedUser.avatar,
        permissions: ROLE_PERMISSIONS[formData.role],
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updates);
      
      setUsers(prev => prev.map(user => 
        user.uid === selectedUser.uid ? { ...user, ...updates } : user
      ));
      
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ email: '', password: '', displayName: '', role: 'viewer', avatar: '' });
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(user => user.uid !== userId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      displayName: user.displayName || '',
      role: user.role,
      avatar: user.avatar || ''
    });
    setShowEditModal(true);
  };

  const UserModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </h2>
          <button
            onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={isEdit ? handleUpdateUser : handleAddUser} className="p-6 space-y-4">
          {!isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!isEdit}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required={!isEdit}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p>Le mot de passe doit contenir :</p>
                  <ul className="list-disc pl-4">
                    <li>Au moins 8 caractères</li>
                    <li>Au moins une majuscule</li>
                    <li>Au moins une minuscule</li>
                    <li>Au moins un chiffre</li>
                    <li>Au moins un caractère spécial</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.keys(ROLE_PERMISSIONS).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'avatar
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!userProfile || userProfile.role !== 'superadmin') {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-800">Accès non autorisé</p>
      </div>
    );
  }

  if (loading && !users.length) {
    return <LoadingState message="Chargement des utilisateurs..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadUsers} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
            <p className="text-indigo-100">Gérez les rôles et permissions des utilisateurs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Total Utilisateurs</div>
            <div className="text-3xl font-bold">{users.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Administrateurs</div>
            <div className="text-3xl font-bold">
              {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-lg mb-1">Utilisateurs Actifs</div>
            <div className="text-3xl font-bold">
              {users.filter(u => u.isActive).length}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Liste des utilisateurs</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un utilisateur
            </button>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar || DEFAULT_AVATAR}
                    alt={user.displayName || user.email}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.displayName || user.email}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'team_lead' ? 'bg-green-100 text-green-800' :
                    user.role === 'developer' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role !== 'superadmin' && (
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <UserModal />}
      {showEditModal && <UserModal isEdit />}
    </div>
  );
};

export default UserManagement;