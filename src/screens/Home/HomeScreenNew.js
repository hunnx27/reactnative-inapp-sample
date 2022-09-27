import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Button from '../../lib/components/Button';
import customInappGroupFunc from '../../lib_new/customInapp.js';
import {WebView} from 'react-native-webview';

const HomeScreenNew = ({handleSetRef, handleEndLoading}) => {
  // 결제함수 불러오기
  const {useShoppingState, getItems, requestItemPurchase, consumeAllItemsAndroid, log } = customInappGroupFunc();

  // 웹뷰 관련설정
  const MESSAGE_TYPE = {
    payment_ok1: "PAYMENT_OK_STEP_1",
    payment_ok2: "PAYMENT_OK_STEP_2",
    payment_fail1: "PAYMENT_FAIL_STEP_1",
    payment_fail2: "PAYMENT_FAIL_STEP_2",
    etc: "ETC"
  }
  let uri = 'http://192.168.150.171:5500/index.html';
  //uri = 'https://coverdreamit.co.kr'
  const handleOnMessage = async ({nativeEvent: {data}}) => {
    // data에 웹뷰에서 보낸 값이 들어옵니다.
    console.log('##RN : handleOnMessage : ', data);
    if(data != null){
      const jsonData = JSON.parse(data);
      const targetFunc = jsonData.targetFunc;
      const msgId = jsonData.msgId;
      console.log(targetFunc)
      if(targetFunc == 'GET_ITEMS'){
        /**
         * 
         * 1. 스토어 커넥션 및 상품 목록 가져오기
         * 
         */ 
        const rs = await wb_getItems();
        console.log('result!');
        console.log(rs);
        handleSetRef.current.postMessage(
          JSON.stringify({ msgId:msgId, isSuccessfull:true, args:"['success']", type: MESSAGE_TYPE.etc, detail: rs})
        );
      }else if(targetFunc == 'REQ_PURCHASE'){
        /**
         * 
         * 2. 결제요청
         * 
         */
        const rs = await wb_requestItemPurchase();
        console.log(rs);
        if(rs!=null){
          console.log(Object.keys(rs))
          console.log('message : ' + rs.message); // 오류가 있는 경우에만 리턴됨.
          console.log('code : ' + rs.code); // 오류가 있는 경우에만 리턴됨.
          if(rs.code!=null && rs.code=='E_USER_CANCELLED'){
            // 결제 취소
            handleSetRef.current.postMessage(
              JSON.stringify({ msgId:msgId, isSuccessfull:true, args:"['fail']", type: MESSAGE_TYPE.payment_fail1, detail: rs})
            );
            return;
          }
          if(rs.code!=null){
            // 그외 에러
            handleSetRef.current.postMessage(
              JSON.stringify({ msgId:msgId, isSuccessfull:true, args:"['fail']",type: MESSAGE_TYPE.payment_fail1, detail: rs})
            );
            return;
          }

          // 성공시
          handleSetRef.current.postMessage(
            JSON.stringify({ msgId:msgId, isSuccessfull:true, args:"['success']", type: MESSAGE_TYPE.payment_ok1, detail: rs})
          );
        }
      }else if(targetFunc == 'PURCHASE_OK'){
        /**
         * 
         * 결제완료(최종승인) : 완료하지 않으면 나중에 포인트 회수되고 환불처리됨.
         * 
         */
        const rs = await wb_consumeAllItemsAndroid();
        console.log('result!');
        console.log(rs);
        if(rs!=null && rs.code!=null){
          handleSetRef.current.postMessage(
            JSON.stringify({ msgId:msgId, isSuccessfull:true, type: MESSAGE_TYPE.payment_ok2, detail: rs})
          );
        }else{
          handleSetRef.current.postMessage(
            JSON.stringify({ msgId:msgId, isSuccessfull:true, type: MESSAGE_TYPE.payment_fail2, detail: rs})
          );
        }
        
      }else if(targetFunc == 'PURCHASE_FAIL'){
        alert('TODO 결제실패 : 환불 호출')
      }
    }
    
  }
  const sendWebview = () =>{
    handleSetRef.current.postMessage(
      JSON.stringify({ type: MESSAGE_TYPE.payment_ok1, detail: "결제 성공했습니다."})
    );
  }

  const wb_useShoppingState = () => {
    console.log("Webview Call >> useShoppingState");
    useShoppingState();
  };
  const wb_getItems = async () => {
    console.log("Webview Call >> getItems");
    const rs = await getItems();
    return rs;
  };
  const wb_requestItemPurchase = async () => {
    console.log("Webview Call >> requestItemPurchase");
    const rs = await requestItemPurchase();
    return rs;
  };
  const wb_consumeAllItemsAndroid = async () => {
    console.log("Webview Call >> consumeAllItemsAndroid");
    const rs = await consumeAllItemsAndroid();
    return rs;
  };
  const wb_log = () => {
    console.log("Webview Call >> log");
    log();
  };

  // const debugging = `
  //    // Debug
  //    console = new Object();
  //    console.log = function(log) {
  //      window.webViewBridge.send("console", log);
  //    };
  //    console.debug = console.log;
  //    console.info = console.log;
  //    console.warn = console.log;
  //    console.error = console.log;
  //    `;
  const debugging = `
    //const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
    const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'log':log}));
    console = {
        log: (log) => consoleLog('log', log),
        debug: (log) => consoleLog('debug', log),
        info: (log) => consoleLog('info', log),
        warn: (log) => consoleLog('warn', log),
        error: (log) => consoleLog('error', log),
      };
`;

  console.log('init! hello!');
  return (
    <View style={styles.container}>
      <View style={{...styles.fixTotext, display:'flex'}}>
        {/* <View style={styles.item}><Button title="useStoreState(스토어커넥션연결)" handlePress={useShoppingState} /></View> */}
        <View style={styles.item}><Button title="getItems(단건상품가져오기)*" handlePress={getItems} /></View>
        <View style={styles.item}><Button title="requestItemPurchase(단건상품결제하기)" handlePress={requestItemPurchase} /></View>
        <View style={styles.item}><Button title="consumeAllItemsAndroid(단품상품초기화?)" handlePress={consumeAllItemsAndroid} /></View>
        {/* <View style={styles.item}><Button title="log(로그!)" handlePress={log} /></View> */}
        <View style={styles.item}><Button title="웹뷰데이터전송" handlePress={sendWebview} /></View>
      </View>
      <WebView
        onLoadEnd={handleEndLoading}
        onMessage={handleOnMessage}
        ref={handleSetRef}
        source={{ uri }}
        injectedJavaScript={debugging}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'lightblue',
  },
  msg: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 16,
  },
  item:{
    
  },
});
export default HomeScreenNew;