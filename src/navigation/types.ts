import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Consult: undefined;
  Shop: undefined;
  Records: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  DoctorDetail: {
    doctorId: string;
  };
  Bookings: undefined;
  ProductDetail: {
    productId: string;
  };
  Cart: undefined;
  Wishlist: undefined;
  Checkout: undefined;
  RecordDetail: {
    recordId: string;
  };
  AttachmentPreview: {
    recordId: string;
    attachmentId: string;
  };
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
