import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';
import {getWorkerFullName} from '../services/firestore/roles';
import {styles} from '../styles/Globals';

interface WorkerItemProps {
  workerId: any;
}

const WorkerItem: React.FC<WorkerItemProps> = ({workerId: workerId}) => {
  const [workerName, setWorkerName] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchWorkerName() {
      const name = await getWorkerFullName(workerId); // Fetch full name by userId
      setWorkerName(name);
    }

    fetchWorkerName();
  }, [workerId]);

  return <Text style={[styles.boldText]}>{workerName ?? 'Loading...'}</Text>;
};

export default WorkerItem;
