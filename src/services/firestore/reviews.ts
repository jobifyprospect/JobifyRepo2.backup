import firestore from '@react-native-firebase/firestore';
import {Review} from '../interfaces/review';
import {FIRESTORE_DB} from '../../config/firebase';

// Firestore collection reference
const reviewsRef = FIRESTORE_DB.collection('reviews');

// Add a new review
export const addReview = async (
  reviewData: Omit<Review, 'reviewId' | 'createdAt' | 'updatedAt'>,
): Promise<void> => {
  try {
    await reviewsRef.add({
      ...reviewData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding review: ', error);
  }
};

// Get all reviews for an application
export const getReviewsByApplicationId = async (
  applicationId: string,
): Promise<Review[]> => {
  const snapshot = await reviewsRef
    .where('applicationId', '==', applicationId)
    .get();
  return snapshot.docs.map(doc => ({
    reviewId: doc.id,
    ...doc.data(),
  })) as Review[];
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await reviewsRef.doc(reviewId).delete();
  } catch (error) {
    console.error('Error deleting review: ', error);
  }
};
