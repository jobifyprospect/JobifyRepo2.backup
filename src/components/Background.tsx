import {Dimensions, Platform, StyleSheet, View} from 'react-native';
import React from 'react';
import Colors from '../styles/Colors';

const width = Dimensions.get('window').width; //full width

const Background = () => {
  return (
    <>
      <View style={backgroundStyles.topCircle} />
      <View style={backgroundStyles.bottomCircle} />
      <View style={backgroundStyles.bottom} />
    </>
  );
};
const backgroundStyles = StyleSheet.create({
  topCircle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? -450 : -500,
    left: -100,
    width: 600,
    height: 600,
    aspectRatio: 1,
    backgroundColor: Colors.primary,
    borderRadius: 600,
    zIndex: 3,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: 50,
    left: -100,
    width: 600,
    height: 600,
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: 600,
    zIndex: 2,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    height: 200,
    backgroundColor: Colors.primary,
    flex: 1,
    width: width,
  },
});
export default Background;
