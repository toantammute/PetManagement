import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '../../theme/color';

const Home = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.white}
      />
      <View>
        <Text>Homes</Text>
      </View>
    </>
  );
}
export default Home;


