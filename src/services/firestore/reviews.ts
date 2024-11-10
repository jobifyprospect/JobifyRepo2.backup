import { showAlert } from '../../components/AlertDialog';
import { FIRESTORE_DB } from '../../config/firebase';
import { Review } from '../interfaces/review';
import { collection, getDocs, query, where } from '@react-native-firebase/firestore';

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

export async function getReviewsByAppId(applicationId: string[]): Promise<Review[]> {
  try {
    // Create an empty array to store fetched reviews
    const reviews: Review[] = [];

    // Loop through each application ID and fetch reviews
    for (const appId of applicationId) {
      const reviewsQuery = query(reviewsRef, where("application_id", "==", appId));
      const querySnapshot = await getDocs(reviewsQuery);

      // Process fetched reviews (optional)
      querySnapshot.forEach((doc) => {
        const reviewData = doc.data() as Review;
        // You can add optional processing/formatting here
        reviews.push(reviewData);
      });
    }

    return reviews; // Return the combined reviews
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error; // Re-throw the error for proper handling
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