import {Alert} from 'react-native';

export const showAlert = (
  title: string,
  message: string,
  callback?: () => void, // Nullable callback parameter
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'PROCEED',
        onPress: () => {
          if (callback) {
            callback(); // Call the callback if it exists
          }
        },
      },
    ],
    {cancelable: true},
  );
};
