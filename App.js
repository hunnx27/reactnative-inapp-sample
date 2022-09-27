import React, {useRef} from 'react';
// import HomeScreen from './src/screens/Home/HomeScreen';
import HomeScreenNew from './src/screens/Home/HomeScreenNew';
import {withIAPContext} from 'react-native-iap';

const App = () => {
  // 웹뷰와 rn과의 소통은 아래의 ref 값을 이용하여 이루어집니다.
  let webviewRef = useRef();

  /** 웹뷰 ref */
  const handleSetRef = (_ref) => {
    webviewRef = _ref;
  };

  /** webview 로딩 완료시 */
  const handleEndLoading = e => {
    console.log("handleEndLoading");
    /** rn에서 웹뷰로 정보를 보내는 메소드 */
    webviewRef.current.postMessage("로딩 완료시 webview로 정보를 보내는 곳");
  };

  // return <HomeScreen />;
  return (
    <HomeScreenNew 
      webviewRef={webviewRef}
      handleSetRef={webviewRef}
      handleEndLoading={handleEndLoading}    
    />
  );
};

export default withIAPContext(App);