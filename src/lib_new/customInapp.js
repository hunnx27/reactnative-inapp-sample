import {useEffect, useState} from 'react';
import RNIap, {InAppPurchase, PurchaseError, finishTransaction, useIAP} from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';


const customInappGroupFunc = () => {
  let purchaseUpdateSubscription;
  let purchaseErrorSubscription;
  const [loading, setLoading] = useState(false);
  console.log(loading);

  const {
    // connected,
    // products,
    // promotedProductsIOS,
    // subscriptions,
    // purchaseHistories,
    // availablePurchases,
    currentPurchase,
    currentPurchaseError,
    // initConnectionError,
    //finishTransaction,
    // getProducts,
    // getSubscriptions,
    //getAvailablePurchases,
    // getPurchaseHistories,
  } = useIAP();
  
  const log = () => {
    // console.log('connected: ' + connected);
    // console.log('products: ' + products);
    // console.log('promotedProductsIOS: ' + promotedProductsIOS);
    // console.log('subscriptions: ' + subscriptions);
    // console.log('purchaseHistories: ' + purchaseHistories);
    // console.log('availablePurchases: ' + availablePurchases);
    
    console.log(currentPurchase);
    if(false){
      console.log('productId: ' + currentPurchase.productId);
      console.log('transactionId: ' + currentPurchase.transactionId);
      console.log('transactionDate: ' + currentPurchase.transactionDate);
      console.log('transactionReceipt: ' + currentPurchase.transactionReceipt);
      console.log('purchaseToken: ' + currentPurchase.purchaseToken);
      console.log('quantityIOS: ' + currentPurchase.quantityIOS);
      console.log('originalTransactionDateIOS: ' + currentPurchase.originalTransactionDateIOS);
      console.log('originalTransactionIdentifierIOS: ' + currentPurchase.originalTransactionIdentifierIOS);
      console.log('dataAndroid: ' + currentPurchase.dataAndroid);
      console.log('signatureAndroid: ' + currentPurchase.signatureAndroid);
      console.log('autoRenewingAndroid: ' + currentPurchase.autoRenewingAndroid);
      console.log('purchaseStateAndroid: ' + currentPurchase.purchaseStateAndroid);
      console.log('isAcknowledgedAndroid: ' + currentPurchase.isAcknowledgedAndroid);
      console.log('packageNameAndroid: ' + currentPurchase.packageNameAndroid);
      console.log('developerPayloadAndroid: ' + currentPurchase.developerPayloadAndroid);
      console.log('obfuscatedAccountIdAndroid: ' + currentPurchase.obfuscatedAccountIdAndroid);
      console.log('obfuscatedProfileIdAndroid: ' + currentPurchase.obfuscatedProfileIdAndroid);
      console.log('userIdAmazon: ' + currentPurchase.userIdAmazon);
      console.log('userMarketplaceAmazon: ' + currentPurchase.userMarketplaceAmazon);
      console.log('userJsonAmazon: ' + currentPurchase.userJsonAmazon);
      console.log('isCanceledAmazon: ' + currentPurchase.isCanceledAmazon);
    }
    
    // console.log('currentPurchaseError: ' + currentPurchaseError);
    // console.log('initConnectionError: ' + initConnectionError);
    //console.log('finishTransaction: ' + finishTransaction);
    // console.log('getProducts: ' + getProducts);
    // console.log('getSubscriptions: ' + getSubscriptions);
    // console.log('getAvailablePurchases: ' + getAvailablePurchases);
    // console.log('getPurchaseHistories: ' + getPurchaseHistories);
  }

  // 단건 상품
  const itemSkus = Platform.select({
    android: [
      'point_1'
    ],
    ios: [
      'point_1'
    ],
  });

  // @Deprecated 구독 상품(구독 미사용)
  const itemSubs = Platform.select({
    ios: [
      // 'ios_monthly_subs_id',
      // 'ios_yearly_subs_id'
    ],
    android: [
      // 'aos_monthly_subs_id',
      // 'aos_yearly_subs_id'
    ]
  });

  /**
   * 스토어 커넥션 확인
   */
  const useShoppingState =  async () => {
    console.log('useShoppingState')

    useEffect(() => {
      const connection = async () => {
        try {
          // 스토어 초기 커넥션 연결
          const init = await RNIap.initConnection();
          const initCompleted = init === true;
          
          if (initCompleted) {
            // 플랫폼에 따른 상품초기화
            if (Platform.OS === 'android') {
              await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
            } else {
              await RNIap.clearTransactionIOS();
            }
          }
          
          // 결제 성공시 리스너 등록
          purchaseUpdateSubscription = purchaseUpdatedListener(
            async (purchase) => {
              console.log('# 결제 성공!!');
              const receipt = purchase.transactionReceipt ? purchase.transactionReceipt : purchase.purchaseToken;
              
              if (receipt) {
                try {
                  setLoading(false);
                  const isConsumable = true


                  const ackResult = await finishTransaction(purchase, isConsumable);
                  
                  // 구매이력 저장 및 상태 갱신
                  if (purchase) {
                    
                  }
                } catch(error) {
                  console.log('ackError: ', error);
                }
              }
            }
          );

          // 결제 오류시 리스너
          purchaseErrorSubscription = purchaseErrorListener((error) => {
            console.log('# 결제 오류!!');
            setLoading(false);
           
            // 정상적인 에러상황 대응
            const USER_CANCEL = 'E_USER_CANCELED';
            if (error && error.code === USER_CANCEL) {
              Alert.alert('구매 취소', '구매를 취소하셨습니다.');
            } else {
              Alert.alert('구매 실패', '구매 중 오류가 발생하였습니다.');
            }
          });
        } catch(error) {
          console.log('connection error: ', error);
        }
      }
      connection();
      console.log(purchaseUpdateSubscription);
      console.log(purchaseErrorSubscription);

      return () => {
        if (purchaseUpdateSubscription) {
          //purchaseUpdateSubscription.remove();
          //purchaseUpdateSubscription = null;
        }
        if (purchaseErrorSubscription) {
          //purchaseErrorSubscription.remove();
          //purchaseErrorSubscription = null;
        }
        RNIap.endConnection();
      }
    }, [])// END UseEffect
  }// END useShoppingState()

  /**
     * 상품 가져오기 함수
     */
   const getItems = async () => {
    try {
      const items = await RNIap.getProducts(itemSkus);
      // items 저장
      // console.log('# item 목록 조회');
      // console.log('{');
      // console.log(items)
      // console.log('}');
      return items;
    } catch(error) {
      console.log('get item error: ', error);
      return error;
    }
  }

  /**
     * 단건 결제 요청 함수
     */
   const requestItemPurchase = async (sku) => {
    console.log('requestItemPurchase');
    try {
      sku = 'point_1'
      const rs = await RNIap.requestPurchase(sku);
      //console.log(rs);
      return rs;
    } catch(error) {
      console.log('request purchase error: ', error);
      Alert.alert(error.message);
      return error;
    }
  }

  const consumeAllItemsAndroid = async() =>{
    console.log('consumeAllItemsAndroid');
    try{
      const purchases = await RNIap.getAvailablePurchases();
      let ackResults = [];
      for(purchase of purchases){
        console.log(purchase.purchaseToken);
        const isConsumable = true
        const ackResult = await finishTransaction(purchase, isConsumable);
        console.log('##ackResult : ');
        console.log(ackResult);
        ackResults.push(ackResult);
      }
      return ackResults;
    }catch(error){
      console.log('consumeAllItemsAndroid: ', error);
      return error;
    }
  }
  
  /** @Deprecated 구독함수 사용하지 않음 */
  const getSubscriptions = async () => {
    console.log('getSubscriptions');
    try {
      const subscriptions = await RNIap.getSubscriptions(itemSubs);
      // subscriptions 저장
      
    } catch(error) {
      console.log('get subscriptions error: ', error);
    }  
  }
  /** @Deprecated 구독하기 요청 함수*/
  const requestSubscriptionPurchase = async (sub) => {
    console.log('requestSubscriptionPurchase');
    try {
      RNIap.requestPurchase(sub);
    } catch(error) {
      console.log('request purchase error: ', error);
      Alert.alert(error.message);
    }  
  }

  /**
   * @Deprecated 이 앱에서는 사용하지 않음
   * 안드로이드 검증()
   */ 
  const checkReceiptAndroid = async () => {
    let isValidated = false;
    const receipt = await AsyncStorage.getItem('receipt');
    if (receipt) {
      try {
        const purchases = await RNIap.getAvailablePurchases();
        console.debug('checkReceiptAndroid');
        let receipt = purchases[0].transactionReceipt;
        if (Platform.OS === 'android' && purchases[0].purchaseToken) {
          receipt = purchases[0].purchaseToken;
        }
        AsyncStorage.setItem('receipt', receipt);
        isValidated = true;
      } catch (error) {
        isValidated = false;
        AsyncStorage.removeItem('receipt');
      }
    }
    return isValidated;
  };

  
  /**
   * @Deprecated 이 앱에서는 사용하지 않음
   * 아이폰 검증
   */
  const checkReceiptIOS = async () => {
    let isValidated = false;
    const receipt = await AsyncStorage.getItem('receipt');
    if (receipt) {
      const newReceipt = await getReceiptIOS();
      const validated = await validateReceiptIos(
        {
          'receipt-data': newReceipt,
          password: '****************',
        },
        __DEV__,
      );
  
      if (validated !== false && validated.status === 0) {
        isValidated = true;
        AsyncStorage.setItem('receipt', newReceipt);
      } else {
        isValidated = false;
        AsyncStorage.removeItem('receipt');
      }
    }
    return isValidated;
  };

  /** 
   * 복원
  */
  const _restorePurchases = () => {
    setShowLoading(true);
    RNIap.getAvailablePurchases()
      .then((purchases) => {
        console.debug('restorePurchases');
        let receipt = purchases[0].transactionReceipt;
        if (Platform.OS === 'android' && purchases[0].purchaseToken) {
          receipt = purchases[0].purchaseToken;
        }
        AsyncStorage.setItem('receipt', receipt);
        setShowLoading(false);
        setIsSubscription(true);
        Alert.alert(
          ENV.language['restore successful'],
          ENV.language['you have successfully restored your purchase history'],
          [{ text: ENV.language['ok'], onPress: () => actionSheetRef.current?.close() }],
        );
      })
      .catch((err) => {
        console.debug('restorePurchases');
        console.error(err);
        setShowLoading(false);
        setIsSubscription(false);
        AsyncStorage.removeItem('receipt');
        Alert.alert(ENV.language['restore failed'], ENV.language['restore failed reason']);
      });
  };

  

  

  return{
    useShoppingState,
    requestItemPurchase,
    getItems,
    consumeAllItemsAndroid,
    log,
    checkReceiptAndroid,
    checkReceiptIOS,
    _restorePurchases,
    currentPurchaseError,
  }
}


export default customInappGroupFunc;