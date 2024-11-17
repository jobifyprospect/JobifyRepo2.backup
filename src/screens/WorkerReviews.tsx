import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import {NavigationProp, Route} from '@react-navigation/native';
import BackButton from '../components/BackButton';
import Colors from '../styles/Colors';
import {styles} from '../styles/Globals';
import {Review} from '../services/interfaces/review';
import ProfilePicture from '../components/GetProfilePicture'; // Adapt to client usage
import GetFullName from '../components/GetFullName';
import {getReviewsByWorkerId} from '../services/firestore/reviews';
import Svg, {Path} from 'react-native-svg';
import {formatCurrency, formatDateToReadable} from '../utils/Utils';

interface RouterProps {
  navigation: NavigationProp<any, any>;
  route: Route<string, {worker_id: string}>;
}
const ratingDescriptions = [
  'Poor Job',
  'Somewhat Good',
  'Good',
  'Very Good',
  'Excellent',
];
export default function WorkerReviews({navigation, route}: RouterProps) {
  const params_workerId = route.params.worker_id;

  const [reviews, setReviews] = useState<Review[] | null>(null);

  // Fetch reviews by worker ID
  const fetchWorkerReviews = useCallback(async () => {
    try {
      if (params_workerId) {
        const workerReviews = await getReviewsByWorkerId(params_workerId);
        workerReviews && setReviews(workerReviews);
      }
    } catch (error) {
      console.error('Failed to fetch worker reviews:', error);
    }
  }, [params_workerId]);

  useEffect(() => {
    fetchWorkerReviews();
  }, [fetchWorkerReviews]);

  return (
    <View style={localStyles.container}>
      <SafeAreaView style={localStyles.btnContainerBetween}>
        <BackButton onPress={async () => navigation.goBack()} />
      </SafeAreaView>

      <View style={localStyles.screen}>
        <Text style={styles.largeHeading}>Worker Reviews</Text>
        <ScrollView>
          {reviews && reviews.length === 0 ? (
            <Text style={[styles.card, styles.gap]}>No reviews available.</Text>
          ) : (
            reviews?.map(review => (
              <View key={review.reviewId} style={localStyles.reviewContainer}>
                {/* Header with Client Profile */}
                <View style={localStyles.row}>
                  <ProfilePicture
                    uuId={review.clientId}
                    size={50}
                    type={'client'}
                  />
                  <View style={localStyles.row}>
                    <View>
                      <GetFullName uuId={review.clientId} type={'client'} />
                    </View>
                    <Text style={styles.smallText}>
                      {formatDateToReadable(review.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Separator */}
                <View style={localStyles.separator} />
                <View style={localStyles.row}>
                  <Text style={[styles.boldText, localStyles.containInfo]}>
                    {review.jobTitle}
                  </Text>
                  <Text style={[styles.boldText]}>
                    {formatCurrency(review.amount)}
                  </Text>
                </View>
                <View style={localStyles.row}>
                  <Text style={styles.smallText}>
                    Start: {formatDateToReadable(review.startDate)}
                  </Text>
                  <Text style={styles.smallText}>
                    End: {formatDateToReadable(review.endDate)}
                  </Text>
                </View>

                {/* Review Body */}
                <View style={localStyles.reviewBody}>
                  <Text style={[styles.smallText, localStyles.spaceContain]}>
                    Additional Comment:
                  </Text>
                  <Text style={localStyles.regularText}>{review.comment}</Text>
                </View>

                {/* Stars Display */}
                <Text style={[styles.smallText, localStyles.spaceContain]}>
                  Rating: {ratingDescriptions[review.rating - 1]}
                </Text>

                <View style={localStyles.starsContainer}>
                  {Array.from({length: 5}, (_, index) => {
                    const starValue = index + 1;
                    return (
                      <Svg
                        key={index}
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill={
                          review.rating >= starValue
                            ? Colors.primary
                            : Colors.placeholder
                        }>
                        <Path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896l-7.335 3.872 1.4-8.172-5.933-5.787 8.2-1.193L12 .587z" />
                      </Svg>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 25,
    flex: 1,
  },
  regularText: {
    fontStyle: 'italic',
  },
  screen: {
    flex: 1,
    paddingTop: 24,
    rowGap: 24,
  },
  btnContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spaceContain: {
    paddingBottom: 4,
  },
  containRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    width: '100%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 5,
    borderWidth: 1,
    padding: 12,
    paddingBottom: 24,
    borderColor: Colors.placeholder,
    marginBottom: 15,
  },
  clientInfo: {
    // flexDirection: 'row',
    // alignItems: 'center',
    flex: 1,
    // marginBottom: 10,
  },
  containInfo: {
    width: '78%',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.placeholder,
    marginVertical: 8,
  },
  reviewBody: {
    paddingVertical: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 2,
  },
});
