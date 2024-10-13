import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Colors from '../styles/Colors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBell} from '@fortawesome/free-regular-svg-icons';
import {useFocusEffect} from '@react-navigation/native';
import {checkIfNewNotifications} from '../services/firestore/notifications';
import {getCurrentUserUID} from '../config/firebase';

interface NotificationsButtonProps {
  onPress: () => Promise<void>;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
}

const NotificationsButton = forwardRef<
  {
    triggerPress: () => void;
  },
  NotificationsButtonProps
>(({onPress, type = 'primary', disabled = false}, ref) => {
  const [loading, setLoading] = useState(false);
  const [newNotification, setNewNotification] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onPress();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    triggerPress: () => {
      handlePress();
    },
  }));

  const containerStyle: ViewStyle[] = [
    dynamicButtonStyles.button,
    type === 'primary'
      ? dynamicButtonStyles.primary
      : dynamicButtonStyles.secondary,
    disabled ? dynamicButtonStyles.disabled : {},
  ];

  const checkForNewNotifications = async () => {
    try {
      const uid: string | null = await getCurrentUserUID();

      const hasNewNotifications = await checkIfNewNotifications(uid);
      setNewNotification(hasNewNotifications);
    } catch (error) {
      console.error('Error checking for new notifications', error);
    }
  };
  useEffect(() => {
    // Check for new notifications when the component mounts
    checkForNewNotifications();
  }, []);

  // Use useFocusEffect to refetch user profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkForNewNotifications();
    }, []), // Empty dependency array ensures it runs when the screen is focused
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === 'primary' ? Colors.white : Colors.primary}
        />
      ) : (
        <View>
          <FontAwesomeIcon icon={faBell} color={Colors.primary} />
          {newNotification ? <View style={dynamicButtonStyles.circle} /> : null}
        </View>
      )}
    </TouchableOpacity>
  );
});

const dynamicButtonStyles = StyleSheet.create({
  button: {
    height: 46,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: Colors.danger,
    position: 'absolute',
    top: 0,
    right: -2,
  },
  primary: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.placeholder,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.placeholder,
    borderColor: Colors.placeholder,
  },
});

export default NotificationsButton;
