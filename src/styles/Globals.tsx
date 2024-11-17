import {StyleSheet} from 'react-native';
import Colors from './Colors';
import Fonts from './FontSizes';
//TODO ALIGN TO FIGMA DESIGN
//TODO global colors
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 48,
    gap: 1.25,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  w100: {maxWidth: 100, width: 100},
  bold: {fontWeight: Fonts.weights.bold},
  card: {
    borderWidth: 1,
    shadowOpacity: 1,
    borderColor: Colors.primaryWithOpacity10,
    shadowColor: Colors.primaryWithOpacity10,
    flexDirection: 'column',
    backgroundColor: Colors.white,
    borderRadius: 5,
    paddingHorizontal: 24,
    rowGap: 24,
    marginBottom: 60,
  },
  gap: {
    marginTop: 32,
    marginBottom: 32,
    padding: 48,
  },
  headerContainer: {
    gap: 10,
    paddingBottom: 10,
  },
  bottomContainer: {
    paddingTop: 20,
  },
  elevate: {
    zIndex: 3,
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
  mediumRegularText: {
    fontSize: Fonts.sizes.medium,
    fontWeight: Fonts.weights.regular,
    color: Colors.labelText,
  },
  mediumText: {
    fontSize: Fonts.sizes.medium,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.labelText,
  },
  mediumTextBlue: {
    fontSize: Fonts.sizes.medium,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primary,
  },
  largeHeading: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    zIndex: 3,
  },
  xlargeHeading: {
    fontSize: Fonts.sizes.xlarge,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
});
