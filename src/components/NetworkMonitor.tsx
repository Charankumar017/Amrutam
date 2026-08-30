import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { connectivityChanged } from '@/redux/slices/networkSlice';
import { drainOfflineQueue } from '@/services/sync';
import { useOnForeground } from '@/hooks';

export function NetworkMonitor() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      NetInfo.addEventListener(info => {
        const isOnline = Boolean(info.isConnected) && info.isInternetReachable !== false;
        dispatch(
          connectivityChanged({
            isOnline,
            connectionType: info.type ?? 'unknown',
          }),
        );
      }),
    [dispatch],
  );
  useOnForeground(() => {
    void dispatch(drainOfflineQueue());
  });
  return null;
}
