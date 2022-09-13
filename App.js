import React from 'react';
// import HomeScreen from './src/screens/Home/HomeScreen';
import HomeScreenNew from './src/screens/Home/HomeScreenNew';
import {withIAPContext} from 'react-native-iap';
const App = () => {
  // return <HomeScreen />;
  return <HomeScreenNew />;
};

export default withIAPContext(App);