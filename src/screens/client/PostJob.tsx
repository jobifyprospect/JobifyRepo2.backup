import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {styles} from '../../styles/Globals';
import {NavigationProp} from '@react-navigation/native';
import DynamicButton from '../../components/DynamicButton';
import {createJob} from '../../services/firestore/jobs';
import {showAlert} from '../../components/AlertDialog';
import DynamicTextInput from '../../components/DynamicTextInput';
import {FIRESTORE_TIMESTAMP, getCurrentUserUID} from '../../config/firebase';
import {isNotEmpty} from '../../utils/Utils';
import uuid from 'react-native-uuid';
import {Job} from '../../services/interfaces/job';
import BackButton from '../../components/BackButton';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

export default function PostJob({navigation}: RouterProps) {
  const [title, setTitle] = useState('');
  const [pay, setPay] = useState('');
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<
    'open' | 'closed' | 'pending' | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<any>(null);

  // Fetch the current user UID when the component mounts
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const uid = await getCurrentUserUID();
      setCurrentUserId(uid);
    };

    fetchCurrentUserId();
  }, []);

  function resetForm() {
    setTitle('');
    setPay('');
    setSchedule('');
    setLocation('');
    setDescription('');
    setStatus(undefined);
  }

  async function post() {
    Keyboard.dismiss();
    setIsSubmitting(true);

    // Validate form fields
    if (!title || !pay || !schedule || !location || !description) {
      setIsSubmitting(false);
      showAlert('Missing fields.', 'Please fill out all required fields.');
      return;
    }

    if (!currentUserId) {
      setIsSubmitting(false);
      showAlert('User not found', 'Unable to retrieve user information.');
      return;
    }

    try {
      const newJob: Job = {
        location,
        title,
        description,
        schedule,
        pay: parseInt(pay, 10),
        status: status || 'pending',
        jobId: uuid.v4().toString(),
        clientId: currentUserId,
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
      };

      await createJob(newJob);
      showAlert('Success', 'Job posted.');
      navigation.goBack();
      resetForm();
    } catch (error) {
      showAlert(
        'An error occurred while posting the job.',
        (error as Error).message || 'An error occurred',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={localStyles.screen}>
        <View style={localStyles.btnContainerBetween}>
          <BackButton onPress={async () => navigation.goBack()} />
          <DynamicButton
            disabled={isSubmitting}
            title="Post"
            type="primary"
            onPress={post}
          />
        </View>

        <View style={localStyles.headerContainer}>
          <Text style={styles.xlargeHeading}> Post a Job </Text>
        </View>

        <View style={localStyles.content}>
          <DynamicTextInput
            label="Job Title"
            value={title}
            onChangeText={setTitle}
            isValid={isNotEmpty(title)}
            suffixIcon="list"
            keyboardType="default"
            placeholder="Helper, Painting, Cleaning..."
            isRequired
          />

          <DynamicTextInput
            keyboardType="decimal-pad"
            value={pay}
            onChangeText={setPay}
            isValid={isNotEmpty(pay)}
            suffixIcon="peso-sign"
            label="Rate"
            placeholder="Rate/hr"
            isRequired
          />

          <DynamicTextInput
            value={schedule}
            onChangeText={setSchedule}
            isValid={isNotEmpty(schedule)}
            suffixIcon="clock"
            label="Schedule"
            placeholder="Day, hours"
            isRequired
          />

          <DynamicTextInput
            value={location}
            onChangeText={setLocation}
            isValid={isNotEmpty(location)}
            suffixIcon="location-dot"
            label="Address"
            placeholder="Job Location"
            isRequired
          />

          <DynamicTextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            isValid={isNotEmpty(description)}
            suffixIcon="pencil"
            isRequired
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const localStyles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  btnContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingTop: 40,
    gap: 50,
  },
  content: {
    flex: 1,
    gap: 15,
    paddingHorizontal: 16,
    paddingTop: 40,
    rowGap: 0,
  },
});
