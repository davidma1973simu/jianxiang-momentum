// 见象 Momentum · 飞行模式（物理断联）
// 进暂停法自动进入专注态：最佳努力屏蔽系统通知的"弹出/声音/角标"，
// 让这片刻只属于你。真机生效；浏览器无系统通知，自动跳过，不影响体验。
// ⚠️ 行业痛点："物理断联"是付费核心。此处先做到 App 级安静；
//   若要做到 OS 级免打扰（iOS 专注模式 / DND），需在原生层接入 Focus API（后续 P1 原生插件）。
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let active = false;

export function isFlightActive() {
  return active;
}

// 进入飞行：把通知"收起来"，不弹、不响、不角标
export function enterFlight() {
  if (Platform.OS === 'web') return; // 浏览器无系统通知，跳过
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    active = true;
  } catch (e) {
    // 真机未授权通知也不影响体验，静默降级
  }
}

// 退出飞行：恢复系统默认通知行为
export function exitFlight() {
  if (Platform.OS === 'web') return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    // 忽略
  }
  active = false;
}
