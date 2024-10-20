import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {styles} from '../../styles/Globals';
import {NavigationProp} from '@react-navigation/native';
import DynamicButton from '../../components/DynamicButton';
import {createJob} from '../../services/firestore/jobs';
import {showAlert} from '../../components/AlertDialog';
import DynamicTextInput from '../../components/DynamicTextInput';
import {FIRESTORE_TIMESTAMP} from '../../config/firebase';
import {isNotEmpty} from '../../utils/Utils';
import uuid from 'react-native-uuid';
import {Job} from '../../services/interfaces/job';
import BackButton from '../../components/BackButton';
import {
  getCurrentUserUID,
  getIdByRoleId,
  getUser,
} from '../../services/firestore/users';

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

  // Fetch the current user UID only once when the component mounts
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const uid: string | null = await getCurrentUserUID();
        if (uid) {
          const currentRole = await getUser(uid);
          if (currentRole && currentRole.defaultRole) {
            const clientIdByRole = await getIdByRoleId(currentRole.defaultRole);
            setCurrentUserId(clientIdByRole?.clientId || null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
        showAlert('Error', 'Failed to fetch user ID.');
      }
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

  const post = useCallback(async () => {
    if (isSubmitting) {
      return; // Prevent double submission
    }
    Keyboard.dismiss();
    setIsSubmitting(true);

    // Validate form fields
    if (!title || !pay || !schedule || !location || !description) {
      setIsSubmitting(false);
      showAlert('Missing fields.', 'Please fill out all required fields.');
      return;
    }
    if (!currentUserId) {
      showAlert('Error', 'Current user ID is not available.');
      setIsSubmitting(false);
      return; // If currentUserId is not available, don't proceed
    }

    try {
      const newJob: Job = {
        location: location.trim(),
        title: title.trim(),
        description: description.trim(),
        schedule: schedule.trim(),
        pay: parseInt(pay, 10),
        status: status || 'pending',
        jobId: uuid.v4().toString(),
        clientId: currentUserId,
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
      };

      await createJob(newJob);
      resetForm();
      navigation.navigate('ClientDashboardScreen', {updateList: true});
    } catch (error) {
      showAlert(
        'An error occurred while posting the job.',
        (error as Error).message || 'An error occurred',
      );
    } finally {
      setIsSubmitting(false);
      showAlert('Success', 'Job posted.');
    }
  }, [
    currentUserId,
    title,
    pay,
    schedule,
    location,
    description,
    status,
    navigation,
    isSubmitting,
  ]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={localStyles.screen}>
        <View style={localStyles.btnContainerBetween}>
          <BackButton onPress={async () => navigation.goBack()} />
          <DynamicButton
            disabled={isSubmitting}
            title="Post"
            type="primary"
            onPress={post} // Only call post on button press
          />
        </View>

        <View style={localStyles.headerContainer}>
          <Text style={styles.largeHeading}>Post a Job</Text>
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
    paddingHorizontal: 30,
    flex: 1,
    paddingTop: 25,
  },
  btnContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingBottom: 36,
  },
  content: {
    flex: 1,
  },
});
