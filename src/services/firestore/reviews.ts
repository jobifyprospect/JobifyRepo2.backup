import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB} from '../../config/firebase';
import {Review} from '../interfaces/review';

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
