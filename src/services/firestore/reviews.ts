import { showAlert } from '../../components/AlertDialog';
import { FIRESTORE_DB } from '../../config/firebase';
import { Review } from '../interfaces/review';
import { getDocs, query, where } from '@react-native-firebase/firestore';

const reviewsRef = FIRESTORE_DB.collection('reviews');

export const createReview = async (review: Review): Promise<void> => {
  try {
    await reviewsRef.doc(review.reviewId).set(review);
  } catch (error) {
    showAlert('Error', 'Failed to create review.');
    console.error(error);
  }
};

export const getReview = async (
  reviewId: string,
): Promise<Review | undefined> => {
  try {
    const reviewDoc = await reviewsRef.doc(reviewId).get();
    return reviewDoc.exists ? (reviewDoc.data() as Review) : undefined;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve review.');
    console.error(error);
    return undefined;
  }
};

export const updateReview = async (
  reviewId: string,
  updates: Partial<Review>,
): Promise<void> => {
  try {
    await reviewsRef.doc(reviewId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update review.');
    console.error(error);
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await reviewsRef.doc(reviewId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete review.');
    console.error(error);
  }
};

export async function getReviewsByAppId(
  applicationId: string[],
): Promise<Review[]> {
  try {
    // Create an empty array to store fetched reviews
    const reviews: Review[] = [];
    // Loop through each application ID and fetch reviews
    for (const appId of applicationId) {
      const reviewsQuery = query(
        reviewsRef,
        where('applicationId', '==', appId),
      );
      const querySnapshot = await getDocs(reviewsQuery);

      // Process fetched reviews (optional)
      querySnapshot.forEach(doc => {
        const reviewData = doc.data() as Review;
        // You can add optional processing/formatting here
        reviews.push(reviewData);
      });
    }

    return reviews; // Return the combined reviews
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error; // Re-throw the error for proper handling
  }
}
export const getReviewsByWorkerId = async (
  workerId: string,
): Promise<Review[]> => {
  try {
    const reviewsSnapshot = await reviewsRef
      .where('workerId', '==', workerId)
      .get();

    if (reviewsSnapshot.empty) {
      console.log(`No reviews found for workerId: ${workerId}`);
      return [];
    }

    const reviews: Review[] = reviewsSnapshot.docs.map(doc => ({
      reviewId: doc.id,
      ...doc.data(),
    })) as Review[];

    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for workerId ${workerId}:`, error);
    throw error;
  }
};
export async function getReviewForJob(
  jobTitle: string,
  clientId: string,
): Promise<boolean> {
  try {

    const reviewSnapshot = await reviewsRef // Name of your collection
      .where('jobTitle', '==', jobTitle)
      .where('clientId', '==', clientId) // Ensure to match clientId
      .get();

    // If the snapshot has any documents, return true
    if (!reviewSnapshot.empty) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking review existence: ', error);
    return false; // Return false in case of any error
  }
}
// export function getReviewsByWorker(applicationId: string[]): Promise<Review[]> {
//   return new Promise((resolve, reject) => {
//     const unsubscribe = reviewsRef
//       .where('application_id', '==', applicationId)
//       .orderBy('createdAt', 'asc')
//       .onSnapshot(
//         snapshot => {
//           const reviews: Review[] = [];
//           snapshot.forEach(doc => {
//             reviews.push(doc.data() as Review);
//           });
//           resolve(reviews); // Resolve with the fetched reviews
//         },
//         error => {
//           console.error('Error getting documents:', error);
//           reject(error); // Reject on error
//         },
//       );

//     // Return the unsubscribe function to be used in the cleanup
//     return () => unsubscribe();
//   });
// }

export const calculateAverageRating = async (workerId: string) => {
  const reviewsSnapshot = await reviewsRef // Replace with your actual collection name
    .where('workerId', '==', workerId)
    .get();

  const reviews = reviewsSnapshot.docs.map(doc => doc.data());
  const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length ? totalRatings / reviews.length : 0;
  const reviewCount = reviews.length;

  return { averageRating, reviewCount };
};
