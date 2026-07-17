// 见象 Momentum · 数据层（隐私铁律：只存枚举/整数，绝不存任何文本）
// 本地优先，用 AsyncStorage。任何用户输入的文本永不入库、永不上传。
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_MOMENTS = 'jx.moments.v1';
const KEY_SETTINGS = 'jx.settings.v1';

// 枚举定义（与 PRD §5 一致）
export const Phase = {
  PAUSE: 'pause', // 大象暂停法
  DAWN: 'dawn', // 晨间锚点
  DUSK: 'dusk', // 晚间复盘
  FOUR: 'four', // 四步照象（深度工具）
  HELP: 'help', // 求助过滤网（深度工具）
};

// MomentRecord —— 单次记录，只含枚举/整数/短枚举数组
// { id, phase, tag(NeedTag|null), bodyPart(index|null), value(0-100|null),
//   phraseTouched(bool), phraseIndex(int|null), meta(object|null), createdAt(ts) }
// meta 只放枚举：
//   four: { appearance, ask, need, firstStep }
//   help: { who, what, done, intent }
export async function addMoment({
  phase,
  tag = null,
  bodyPart = null,
  value = null,
  phraseTouched = false,
  phraseIndex = null,
  meta = null,
}) {
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    phase,
    tag, // 枚举字符串
    bodyPart, // 索引整数（对应 BODY_PARTS），或 null
    value, // 整数，如晚间滑块 0-100
    phraseTouched: !!phraseTouched,
    phraseIndex: phraseIndex ?? null,
    meta: meta ? { ...meta } : null, // 只存枚举
    createdAt: Date.now(),
  };
  const list = await getMoments();
  list.push(record);
  await AsyncStorage.setItem(KEY_MOMENTS, JSON.stringify(list));
  return record;
}

export async function markTouched(id, { phraseIndex } = {}) {
  const list = await getMoments();
  const m = list.find((x) => x.id === id);
  if (m) {
    m.phraseTouched = true;
    if (phraseIndex !== undefined && m.phraseIndex === null) {
      m.phraseIndex = phraseIndex;
    }
    await AsyncStorage.setItem(KEY_MOMENTS, JSON.stringify(list));
  }
}

export async function getMoments() {
  try {
    const raw = await AsyncStorage.getItem(KEY_MOMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// 取今日记录（本地日期）
export async function getTodayMoments() {
  const list = await getMoments();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return list.filter((m) => m.createdAt >= start);
}

// 设置（含全局静音开关、飞行模式自动开启 —— 声景铁律：可整体静音）
export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY_SETTINGS);
    return {
      soundOn: true,
      hapticOn: true,
      flightAuto: false, // 进暂停法是否自动进入飞行（专注断联），默认不自动，用户从“飞一会儿”进入才开启
      seenOnboard: false, // 是否看过首次引导
      ...(raw ? JSON.parse(raw) : {}),
    };
  } catch (e) {
    return { soundOn: true, hapticOn: true, flightAuto: true };
  }
}

export async function setSettings(patch) {
  const cur = await getSettings();
  const next = { ...cur, ...patch };
  await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(next));
  return next;
}
