import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';
import {
  getWorkerFullName,
  getClientFullName,
} from '../services/firestore/roles';
import {styles} from '../styles/Globals';

interface GetFullNameProps {
  uuId: string; // User ID
  type: 'client' | 'worker'; // Role type
}

const GetFullName: React.FC<GetFullNameProps> = ({uuId, type}) => {
  const [fullName, setFullName] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchFullName() {
      try {
        const fetchFullNameFunc =
          type === 'client' ? getClientFullName : getWorkerFullName;
        const name = await fetchFullNameFunc(uuId); // Fetch full name by userId
        setFullName(name);
      } catch (error) {
        console.error(`Failed to fetch full name for ${type}:`, error);
      }
    }

    fetchFullName();
  }, [uuId, type]);

  return <Text style={[styles.boldText]}>{fullName ?? 'Loading...'}</Text>;
};

export default GetFullName;
