import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type PushRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'unsupported' | 'permission_denied' | 'missing_project_id' | 'token_error'; message: string };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId(): string | undefined {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: '바스타임 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 220, 160, 220],
    lightColor: '#277C78',
  });
}

export async function requestExpoPushTokenAsync(): Promise<PushRegistrationResult> {
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'unsupported', message: '웹에서는 앱 푸시 알림을 사용할 수 없습니다.' };
  }

  await ensureAndroidChannel();

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (finalStatus !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    return { ok: false, reason: 'permission_denied', message: '알림 권한이 꺼져 있습니다.' };
  }

  const projectId = getProjectId();
  if (!projectId) {
    return { ok: false, reason: 'missing_project_id', message: 'Expo projectId를 찾지 못했습니다.' };
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return { ok: true, token: token.data };
  } catch (error) {
    return {
      ok: false,
      reason: 'token_error',
      message: error instanceof Error ? error.message : '푸시 토큰을 만들지 못했습니다.',
    };
  }
}
