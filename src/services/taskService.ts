import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  Timestamp,
  where,
  arrayContains
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task } from '../types/task';

const COLLECTION_NAME = 'tasks';

export const taskService = {
  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const taskData = {
        ...data,
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        dueDate: Timestamp.fromDate(new Date(data.dueDate)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), taskData);
      return { id: docRef.id, ...taskData };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(id: string, data: Partial<Task>) {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      // Convertir les dates si elles sont présentes
      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
      }
      if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(new Date(data.dueDate));
      }

      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async getAllTasks() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  },

  async getTasksByProject(projectId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting project tasks:', error);
      throw error;
    }
  },

  async getTasksByAssignee(assigneeId: string) {
    try {
      // Validation de l'assigneeId
      if (!assigneeId || typeof assigneeId !== 'string') {
        throw new Error('AssigneeId valide requis');
      }

      // Utiliser la requête Firebase pour les tableaux
      const q = query(
        collection(db, COLLECTION_NAME),
        where('assignees', 'array-contains', {
          id: assigneeId
        })
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error getting assignee tasks:', error);
      throw error;
    }
  },

  async getTasksByMultipleAssignees(assigneeIds: string[]) {
    try {
      // Validation des assigneeIds
      if (!Array.isArray(assigneeIds) || assigneeIds.length === 0) {
        throw new Error('Au moins un assigneeId est requis');
      }

      if (!assigneeIds.every(id => typeof id === 'string' && id.length > 0)) {
        throw new Error('Tous les assigneeIds doivent être des chaînes non vides');
      }

      // Récupérer toutes les tâches où au moins un des assignés est présent
      const promises = assigneeIds.map(assigneeId => 
        this.getTasksByAssignee(assigneeId)
      );

      const tasksArrays = await Promise.all(promises);
      
      // Fusionner et dédupliquer les résultats
      const uniqueTasks = new Map<string, Task>();
      tasksArrays.flat().forEach(task => {
        uniqueTasks.set(task.id, task);
      });

      return Array.from(uniqueTasks.values());
    } catch (error) {
      console.error('Error getting tasks for multiple assignees:', error);
      throw error;
    }
  }
};

export default taskService;