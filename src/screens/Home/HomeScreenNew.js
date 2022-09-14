import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Button from '../../lib/components/Button';
import customInappGroupFunc from '../../lib_new/customInapp.js';
import {WebView} from 'react-native-webview';

const HomeScreenNew = ({handleSetRef, handleEndLoading}) => {
  // 결제함수 불러오기
  const {useShoppingState, getItems, requestItemPurchase, consumeAllItemsAndroid, log } = customInappGroupFunc();

  // 웹뷰 관련설정
  const uri = 'http://192.168.150.171:5500/index.html';
  const handleOnMessage = ({nativeEvent: {data}}) => {
    // data에 웹뷰에서 보낸 값이 들어옵니다.
    console.log(data);
  }

  
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
      <Button title="log(로그!)" handlePress={log} />
      
      <WebView
        onLoadEnd={handleEndLoading}
        onMessage={handleOnMessage}
        ref={handleSetRef}
        source={{ uri }}
      />
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