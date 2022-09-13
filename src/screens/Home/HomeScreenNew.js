import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Button from '../../lib/components/Button';
import customInappGroupFunc from '../../lib_new/customInapp.js';

const HomeScreenNew = () => {
  const {useShoppingState, getItems, requestItemPurchase, consumeAllItemsAndroid } = customInappGroupFunc();
  
  console.log('init! hello!');
  return (
    <View style={styles.container}>
      <Text>Success Message &gt;&gt;</Text>
      <Text style={{...styles.msg, color: 'green'}}>
        Test
      </Text>
      
      <Button title="useStoreState(스토어커넥션연결)" handlePress={useShoppingState} />
      <Button title="getItems(단건상품가져오기)" handlePress={getItems} />
      <Button title="requestItemPurchase(단건상품결제하기)" handlePress={requestItemPurchase} />
      <Button title="consumeAllItemsAndroid(단품상품초기화?)" handlePress={consumeAllItemsAndroid} />
      
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'lightblue',
    padding: 16,
  },
  msg: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 16,
  },
});
export default HomeScreenNew;