import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Project, Task, TeamMember, FeedbackEntry, WellnessSurvey, Achievement } from '../types';

// Projects Collection
export const projectsCollection = collection(db, 'projects');

export const createProject = async (project: Omit<Project, 'id'>) => {
  return await addDoc(projectsCollection, {
    ...project,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  const projectRef = doc(db, 'projects', id);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteProject = async (id: string) => {
  const projectRef = doc(db, 'projects', id);
  await deleteDoc(projectRef);
};

export const getProject = async (id: string) => {
  const projectRef = doc(db, 'projects', id);
  const projectSnap = await getDoc(projectRef);
  return projectSnap.exists() ? { id: projectSnap.id, ...projectSnap.data() } as Project : null;
};

// Tasks Collection
export const tasksCollection = collection(db, 'tasks');

export const createTask = async (task: Omit<Task, 'id'>) => {
  return await addDoc(tasksCollection, {
    ...task,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const getProjectTasks = async (projectId: string) => {
  const q = query(tasksCollection, where('projectId', '==', projectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Task);
};

// Team Members Collection
export const teamMembersCollection = collection(db, 'teamMembers');

export const createTeamMember = async (member: Omit<TeamMember, 'id'>) => {
  return await addDoc(teamMembersCollection, {
    ...member,
    level: 1,
    points: 0,
    createdAt: new Date().toISOString()
  });
};

export const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
  const memberRef = doc(db, 'teamMembers', id);
  await updateDoc(memberRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

// Feedback Collection
export const feedbackCollection = collection(db, 'feedback');

export const createFeedback = async (feedback: Omit<FeedbackEntry, 'id'>) => {
  return await addDoc(feedbackCollection, {
    ...feedback,
    timestamp: new Date().toISOString()
  });
};

export const getMemberFeedback = async (memberId: string) => {
  const q = query(feedbackCollection, where('to.id', '==', memberId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FeedbackEntry);
};

// Wellness Surveys Collection
export const wellnessSurveysCollection = collection(db, 'wellnessSurveys');

export const createWellnessSurvey = async (survey: Omit<WellnessSurvey, 'id'>) => {
  return await addDoc(wellnessSurveysCollection, {
    ...survey,
    date: new Date().toISOString()
  });
};

export const getMemberSurveys = async (employeeId: string) => {
  const q = query(wellnessSurveysCollection, where('employeeId', '==', employeeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WellnessSurvey);
};

// Achievements Collection
export const achievementsCollection = collection(db, 'achievements');

export const createAchievement = async (achievement: Omit<Achievement, 'id'>) => {
  return await addDoc(achievementsCollection, {
    ...achievement,
    createdAt: new Date().toISOString()
  });
};

export const getMemberAchievements = async (memberId: string) => {
  const q = query(achievementsCollection, where('memberId', '==', memberId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Achievement);
};