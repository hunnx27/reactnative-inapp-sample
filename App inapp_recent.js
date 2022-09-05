import {
  Alert,
  EmitterSubscription,
  Image,
  Platform,
  SectionList,
  Text,
  View,
} from 'react-native';
import RNIap, {
  InAppPurchase,
  Product,
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import React, { useCallback, useEffect, useState } from 'react';


const itemSkus = Platform.select({
  default: [
    'point_1'
  ],
  android: [
    'point_1',
    // 'point_1000', '5000_point', // dooboolab
  ],
});

const itemSubs = Platform.select({
  default: [
  ],
});

function getSkuType(item) {
  switch (item.type) {
    case 'iap':
    case 'inapp':
      return ITEM_TYPE.PRODUCT;

    case 'sub':
    case 'subs':
      return ITEM_TYPE.PRODUCT;
  }
}

//type IOS_PERIOD_UNIT = '' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
function iosConvertPeriodToDays(
  periodCount,
  periodUnit,
) {
  switch (periodUnit) {
    case '':
      return 0;
    case 'DAY':
      return periodCount;
    case 'WEEK':
      return 7 * periodCount;
    case 'MONTH':
      return 30 * periodCount;
    case 'YEAR':
      return 365 * periodCount;
  }
}

// https://developer.android.com/reference/java/time/Period
// type ANDROID_PERIOD =
//   | string
//   | 'P3D'
//   | 'P7D'
//   | 'P1W'
//   | 'P4W2D'
//   | 'P1M'
//   | 'P3M'
//   | 'P1Y';
function androidConvertPeriodToDays(period) {
  const unit = [365, 30, 7, 1];
  return period
    .split(/P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?/)
    .slice(1, 5)
    .map((p, i) => (!p ? 0 : Number(p.replace(/\D/g, '')) * unit[i]))
    .reduce((a, b) => a + b, 0);
}

function getTrialPeriod(subscription) {
  if (!subscription) {
    return 0;
  }

  // const {
  //   introductoryPriceNumberOfPeriodsIOS,
  //   introductoryPriceSubscriptionPeriodIOS,
  //   freeTrialPeriodAndroid,
  // } = subscription;
  switch (Platform.OS) {
    case 'android':
      return androidConvertPeriodToDays(periodAndroid);
    case 'ios':
      return iosConvertPeriodToDays(
        Number(periodCountIOS),
        periodUnitIOS,
      );
    default:
      return 0;
  }
}



let purchaseUpdateSubscription;
let purchaseErrorSubscription;

function Intro() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaidAmount, setTotalPaidAmount] = useState(10000);


  const getProducts = useCallback(async () => {
    
    //RNIap.clearProductsIOS();
    
    try {
      const result = await RNIap.initConnection();
      
      //await RNIap.consumeAllItemsAndroid();
      console.log('result', result);
    } catch (err) {
      Alert.alert(err.code, err.message);
      console.warn(err.code, err.message);
    }

    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            const ackResult = await finishTransaction(purchase);
            console.log('ackResult', ackResult);
          } catch (ackErr) {
            console.warn('ackErr', ackErr);
          }

          Alert.alert('purchase error', JSON.stringify(receipt));
        }
      },
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error) => {
        console.log('purchaseErrorListener', error);
        Alert.alert('purchase error', JSON.stringify(error));
      },
    );

    const products = await RNIap.getProducts(itemSkus);
    console.log(products);
    products.forEach((product) => {
      product.type = 'inapp';
    });
    // console.log('products', JSON.stringify(products));
    const subscriptions = await RNIap.getSubscriptions(itemSubs);
    subscriptions.forEach((subscription) => {
      subscription.type = 'subs';
    });
    console.log('subscriptions', JSON.stringify(subscriptions));
    const list = [
      {
        title: 'ONE_TIME_PURCHASE',
        data: products,
      },
      {
        title: 'SUBSCRIPTION_PURCHASE',
        data: subscriptions,
      },
    ];
    setSections(list);
    setLoading(false);
  }, [sections]);

  useEffect(() => {
    getProducts();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, []);

  const purchase = (item) => {
    if (getSkuType(item) === ITEM_TYPE.PRODUCT) {
      RNIap.requestPurchase(item.productId);
    } else {
      RNIap.requestSubscription(item.productId);
    }
  };

  const renderHeader = () => (
    <View>
      <Text
        style={{
          fontSize: 28,
          color: 'white',
        }}
      >
        {totalPaidAmount.toLocaleString()}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 16,
          color: 'white',
        }}
      >
        {'TOTAL_PURCHASE'}
      </Text>
    </View>
  );

  const renderSectionHeader = (title) => (
    <View
      style={{
        height: 40,
        flexDirection: 'row',
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          marginTop: 12,
        }}
      >
        {title}
      </Text>
    </View>
  );

  const renderItem = (item) => (
    <View
      style={{
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 1,
      }}
    >
      <Image
        source={IC_COIN}
        style={{
          height: 80,
          width: 80,
        }}
      />
      <View
        style={{
          flexDirection: 'column',
          marginLeft: 32,
          marginRight: 20,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
          }}
        >
          {item.productId}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          {getSkuType(item) === ITEM_TYPE.SUBSCRIPTION &&
            getTrialPeriod(item) !== 0 &&
            `FREE TRIAL DAYS: ${getTrialPeriod(item)}`}
        </Text>
        <Button
          containerStyle={{
            width: 120,
            marginTop: 16,
          }}
          style={{
            height: 40,
            width: 120,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 10,
          }}
          textStyle={{
          }}
          onPress={() => purchase(item)}
          text={item.localizedPrice}
        />
      </View>
    </View>
  );

  return (
    <>
      <SectionList
        style={{ width: '100%' }}
        ListHeaderComponent={renderHeader}
        refreshing={loading}
        onRefresh={getProducts}
        // @ts-ignore
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => renderItem(item)}
        renderSectionHeader={({ section: { title } }) =>
          renderSectionHeader(title)
        }
      />
    </>
  );
}

export default Intro;