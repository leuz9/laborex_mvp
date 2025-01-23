import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, QueryConstraint, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UseFirestoreDataResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFirestoreData<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  deps: any[] = []
): UseFirestoreDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const results: T[] = [];
          snapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as T);
          });
          setData(results);
          setLoading(false);
        } catch (err) {
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, refreshKey, ...deps]);

  const refetch = () => setRefreshKey(k => k + 1);

  return { data, loading, error, refetch };
}