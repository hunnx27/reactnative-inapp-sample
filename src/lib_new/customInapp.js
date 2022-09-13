import {useEffect, useState} from 'react';
import RNIap, {InAppPurchase, PurchaseError, finishTransaction} from 'react-native-iap';
import { Platform, Alert } from 'react-native';


const customInappGroupFunc = () => {
  let purchaseUpdateSubscription;
  let purchaseErrorSubscription;
  const [loading, setLoading] = useState(false);
  console.log(loading);

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

      return () => {
        if (purchaseUpdateSubscription) {
          purchaseUpdateSubscription.remove();
          purchaseUpdateSubscription = null;
        }
        if (purchaseErrorSubscription) {
          purchaseErrorSubscription.remove();
          purchaseErrorSubscription = null;
        }
        RNIap.endConnection();
      }
    }, [])// END UseEffect
  }// END useShoppingState()

  /**
     * 상품 가져오기 함수
     */
   const getItems = async () => {
    console.log('getItems');
    try {
      const items = await RNIap.getProducts(itemSkus);
      // items 저장
      console.log('# item 목록 조회');
      console.log('{');
      console.log(items)
      console.log('}');
    } catch(error) {
      console.log('get item error: ', error);
    }
  }

  /**
     * 단건 결제 요청 함수
     */
   const requestItemPurchase = async (sku) => {
    console.log('requestItemPurchase');
    try {
      sku = 'point_1'
      RNIap.requestPurchase(sku);
    } catch(error) {
      console.log('request purchase error: ', error);
      Alert.alert(error.message);
    }
  }

  const consumeAllItemsAndroid = async() =>{
    console.log('consumeAllItemsAndroid');
    try{
      const purchases = await RNIap.getAvailablePurchases();
      purchases.forEach(async purchase => {
        console.log(purchase.purchaseToken);
        const isConsumable = true
        const ackResult = await finishTransaction(purchase, isConsumable);
        console.log(ackResult);
      })
    }catch(error){
      console.log('consumeAllItemsAndroid: ', error);
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

  

  

  return{
    useShoppingState,
    requestItemPurchase,
    getItems,
    consumeAllItemsAndroid
  }
}


export default customInappGroupFunc;