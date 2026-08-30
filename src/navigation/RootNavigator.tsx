import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DoctorListScreen } from '@/screens/DoctorListScreen';
import { TimelineScreen } from '@/screens/TimelineScreen';
import { ProductListScreen } from '@/screens/ProductListScreen';
import { useTranslation } from '@/hooks/useTranslation';
import { TabIcon } from '@/navigation/TabIcon';
import type { RootStackParamList, TabParamList } from '@/navigation/types';

const DoctorDetailScreen = lazy(() =>
  import('@/screens/DoctorDetailScreen').then(m => ({
    default: m.DoctorDetailScreen,
  })),
);

const BookingsScreen = lazy(() =>
  import('@/screens/BookingsScreen').then(m => ({
    default: m.BookingsScreen,
  })),
);

const ProductDetailScreen = lazy(() =>
  import('@/screens/ProductDetailScreen').then(m => ({
    default: m.ProductDetailScreen,
  })),
);

const CartScreen = lazy(() =>
  import('@/screens/CartScreen').then(m => ({
    default: m.CartScreen,
  })),
);

const CheckoutScreen = lazy(() =>
  import('@/screens/CheckoutScreen').then(m => ({
    default: m.CheckoutScreen,
  })),
);

const WishlistScreen = lazy(() =>
  import('@/screens/WishlistScreen').then(m => ({
    default: m.WishlistScreen,
  })),
);

const RecordDetailScreen = lazy(() =>
  import('@/screens/RecordDetailScreen').then(m => ({
    default: m.RecordDetailScreen,
  })),
);

const AttachmentPreviewScreen = lazy(() =>
  import('@/screens/AttachmentPreviewScreen').then(m => ({
    default: m.AttachmentPreviewScreen,
  })),
);

const Tab = createBottomTabNavigator<TabParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

function ScreenFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" color="#23684A" />
    </View>
  );
}

function guard<P extends object>(scope: string, Component: React.ComponentType<P>) {
  function Guarded(props: P) {
    return (
      <ErrorBoundary scope={scope}>
        <Suspense fallback={<ScreenFallback />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  }
  Guarded.displayName = `Guarded(${scope})`;
  return Guarded;
}

const ConsultTab = guard('tab:Consult', DoctorListScreen);

const ShopTab = guard('tab:Shop', ProductListScreen);

const RecordsTab = guard('tab:Records', TimelineScreen);

const DoctorDetail = guard('screen:DoctorDetail', DoctorDetailScreen);

const Bookings = guard('screen:Bookings', BookingsScreen);

const ProductDetail = guard('screen:ProductDetail', ProductDetailScreen);

const Cart = guard('screen:Cart', CartScreen);

const Wishlist = guard('screen:Wishlist', WishlistScreen);

const Checkout = guard('screen:Checkout', CheckoutScreen);

const RecordDetail = guard('screen:RecordDetail', RecordDetailScreen);

const AttachmentPreview = guard('screen:AttachmentPreview', AttachmentPreviewScreen);

const renderConsultIcon = ({ color }: { color: string }) => <TabIcon name="Consult" color={color} />;

const renderShopIcon = ({ color }: { color: string }) => <TabIcon name="Shop" color={color} />;

const renderRecordsIcon = ({ color }: { color: string }) => <TabIcon name="Records" color={color} />;

function Tabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#23684A',
        tabBarInactiveTintColor: '#5D665A',
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Consult"
        component={ConsultTab}
        options={{
          title: t('tab.consult'),
          tabBarIcon: renderConsultIcon,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopTab}
        options={{
          title: t('tab.shop'),
          tabBarIcon: renderShopIcon,
        }}
      />
      <Tab.Screen
        name="Records"
        component={RecordsTab}
        options={{
          title: t('tab.records'),
          tabBarIcon: renderRecordsIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: '#14170F',
        headerShadowVisible: false,
        contentStyle: styles.content,
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DoctorDetail"
        component={DoctorDetail}
        options={{
          title: 'Practitioner',
        }}
      />
      <Stack.Screen
        name="Bookings"
        component={Bookings}
        options={{
          title: 'Consultations',
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{
          title: 'Product',
        }}
      />
      <Stack.Screen
        name="Cart"
        component={Cart}
        options={{
          title: 'Cart',
        }}
      />
      <Stack.Screen
        name="Wishlist"
        component={Wishlist}
        options={{
          title: 'Wishlist',
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={Checkout}
        options={{
          title: 'Checkout',
        }}
      />
      <Stack.Screen
        name="RecordDetail"
        component={RecordDetail}
        options={{
          title: 'Record',
        }}
      />
      <Stack.Screen
        name="AttachmentPreview"
        component={AttachmentPreview}
        options={{
          title: 'Attachment',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFBFA',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E8EAE6',
  },
  header: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    backgroundColor: '#FBFBFA',
  },
});
