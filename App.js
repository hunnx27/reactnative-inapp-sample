import React from 'react';
import HomeScreen from './src/screens/Home/HomeScreen';
import {withIAPContext} from 'react-native-iap';

const App = () => {
  return <HomeScreen />;
};

export default withIAPContext(App);