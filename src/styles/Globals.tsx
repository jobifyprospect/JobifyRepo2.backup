import {StyleSheet} from 'react-native';
import Colors from './Colors';
import Fonts from './FontSizes';
//TODO ALIGN TO FIGMA DESIGN
//TODO global colors
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 50,
  },
  smallText: {
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.regular,
    color: Colors.labelText,
  },
  smallSemiBoldText: {
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.labelText,
  },
  errorText: {
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.regular,
    color: Colors.danger,
  },
  regularText: {
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.regular,
    color: Colors.labelText,
  },
  boldText: {
    fontSize: Fonts.sizes.regular,
    fontWeight: Fonts.weights.bold,
    color: Colors.labelText,
  },
  mediumText: {
    fontSize: Fonts.sizes.medium,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.labelText,
  },
  largeHeading: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  xlargeHeading: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
});
