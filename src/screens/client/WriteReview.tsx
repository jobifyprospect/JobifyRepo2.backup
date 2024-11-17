import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, SafeAreaView} from 'react-native';
import {showAlert} from '../../components/AlertDialog';
import {createReview} from '../../services/firestore/reviews';
import Colors from '../../styles/Colors';
import DynamicTextInput from '../../components/DynamicTextInput';
import DynamicButton from '../../components/DynamicButton';
import {RootStackParamList} from '../interfaces/RouterStackInterfaceParams';
import {NavigationProp, RouteProp} from '@react-navigation/native';
import {formatDateToReadable} from '../../utils/Utils';
import Svg, {Path} from 'react-native-svg'; // Importing react-native-svg
import ProfilePicture from '../../components/GetProfilePicture';
import GetFullName from '../../components/GetFullName';
import uuid from 'react-native-uuid';
import {FIRESTORE_TIMESTAMP} from '../../config/firebase';
import {getApplicationsByJobId} from '../../services/firestore/applications';
import {Application} from '../../services/interfaces/application';
import BackButton from '../../components/BackButton';

interface RouterProps {
  navigation: NavigationProp<any, any>;
  route: RouteProp<RootStackParamList, 'WriteReview'>;
}

export default function WriteReviewScreen({navigation, route}: RouterProps) {
  const {job} = route.params;
  const [rating, setRating] = useState<number>(0); // Current star rating
  const [comment, setComment] = useState<string>(''); // User comment
  const [applications, setApplications] = useState<Application[]>([]);
  // Rating descriptions
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const fetchedApplications = await getApplicationsByJobId(job.jobId);
        setApplications(fetchedApplications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        showAlert('Error', 'Failed to load applications.');
      }
    };

    if (job?.jobId) {
      fetchApplications();
    }
  }, [job?.jobId]);
  const ratingDescriptions = [
    'Poor Job',
    'Somewhat Good',
    'Good',
    'Very Good',
    'Excellent',
  ];

  const handleSubmit = async () => {
    if (!rating) {
      showAlert('Error', 'Please select a rating.');
      return;
    }

    const newReview = {
      reviewId: uuid.v4().toString(),
      applicationId: applications[0].applicationId,
      clientId: job.clientId,
      workerId: job.assignedWorker,
      jobTitle: job.title,
      startDate: job.createdAt,
      endDate: job.updatedAt,
      amount: applications[0].offer,
      rating,
      comment,
      createdAt: FIRESTORE_TIMESTAMP,
      updatedAt: FIRESTORE_TIMESTAMP,
    };

    try {
      await createReview(newReview);
      showAlert('Success', 'Your review has been submitted.');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.btnContainerBetween}>
        <BackButton onPress={async () => navigation.goBack()} />
      </SafeAreaView>
      <View style={styles.card}>
        <View style={styles.row}>
          <ProfilePicture uuId={job.assignedWorker} size={80} type={'worker'} />
          <GetFullName uuId={job.assignedWorker} type={'worker'} />
        </View>

        <Text style={styles.subHeader}>Job Details</Text>
        <Text style={styles.detailText}>Title: {job.title}</Text>
        <Text style={styles.detailText}>
          Start Date: {formatDateToReadable(job.createdAt)}
        </Text>
        <Text style={styles.detailText}>
          End Date: {formatDateToReadable(job.updatedAt)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.header}>Rate the Job</Text>

        {/* Rating Stars */}
        <View style={styles.starsContainer}>
          {Array.from({length: 5}, (_, index) => {
            const starValue = index + 1;
            return (
              <Pressable
                key={index}
                onPress={() => setRating(starValue)}
                style={styles.starWrapper}>
                <Svg
                  width={40}
                  height={40}
                  viewBox="0 0 24 24"
                  fill={
                    rating >= starValue ? Colors.primary : Colors.placeholder
                  }>
                  <Path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896l-7.335 3.872 1.4-8.172-5.933-5.787 8.2-1.193L12 .587z" />
                </Svg>
              </Pressable>
            );
          })}
        </View>

        {/* Rating Description */}
        <Text style={styles.ratingText}>
          {ratingDescriptions[rating - 1] || ''}
        </Text>

        {/* Additional Comments */}
        <DynamicTextInput
          label="Additional Comments"
          placeholder="Additional Comments"
          value={comment}
          onChangeText={setComment}
        />

        {/* Submit Button */}
        <DynamicButton
          title="Submit Review"
          onPress={handleSubmit}
          disabled={rating === 0}
        />
      </View>

      {/* Bottom Card: Job Details */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
    backgroundColor: Colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 6,
    paddingTop: 0,
    paddingBottom: 16,
    borderColor: Colors.placeholder,
    borderBottomWidth: 1,
    borderBottomColor: Colors.placeholder,
    marginBottom: 16,
  },

  btnContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    borderWidth: 1,
    shadowOpacity: 1,
    borderColor: Colors.primaryWithOpacity10,
    shadowColor: Colors.primaryWithOpacity10,
    flexDirection: 'column',
    backgroundColor: Colors.white,
    borderRadius: 5,
    padding: 24,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.labelText,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.labelText,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  starWrapper: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.labelText,
    marginVertical: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.labelText,
    marginBottom: 4,
  },
});
