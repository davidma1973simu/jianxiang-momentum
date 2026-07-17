// 见象 Momentum · 声景层（Soundscape）
// 铁律（见 PRD §4.5）：点睛的单声，默认极轻、可整体静音、一声即止；
// 绝不循环、绝不铺底、绝不连播；绝无通知/成就/奖励音。
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { getSettings } from '../data/store';

// 声音清单 —— 只有两个关键锚点会响
const SOURCES = {
  // 停/息屏：低频温暖钵响（听觉版"大象来了"）
  stop: require('../../assets/sound/stop-bowl.wav'),
  // 触动了我：极轻涟漪回应（非奖励"叮"）
  touch: require('../../assets/sound/touch-ripple.wav'),
};

// 默认音量极低 —— 视觉才是主通道，声音只是草原的回声
const VOLUME = {
  stop: 0.55,
  touch: 0.4,
};

let players = {};
let ready = false;
let muted = false; // 内存态镜像全局静音开关

export async function initSoundscape() {
  if (ready) return;
  try {
    // 尊重系统静音键；不抢占其他音频（不做背景音乐）
    await setAudioModeAsync({
      playsInSilentMode: false,
      shouldRouteThroughEarpiece: false,
    });
    for (const key of Object.keys(SOURCES)) {
      const p = createAudioPlayer(SOURCES[key]);
      p.volume = VOLUME[key];
      players[key] = p;
    }
    const s = await getSettings();
    muted = !s.soundOn;
    ready = true;
  } catch (e) {
    // 声音是锦上添花，失败绝不影响核心体验
    ready = false;
  }
}

// 播放单声（一声即止）。key: 'stop' | 'touch'
export async function play(key) {
  if (muted) return;
  const p = players[key];
  if (!p) return;
  try {
    p.seekTo(0); // 从头播，保证"一声"完整
    p.play();
  } catch (e) {
    // 静默失败
  }
}

// 全局静音开关（与设置联动）
export function setMuted(v) {
  muted = !!v;
}

export function isMuted() {
  return muted;
}

export function disposeSoundscape() {
  for (const key of Object.keys(players)) {
    try {
      players[key].remove();
    } catch (e) {}
  }
  players = {};
  ready = false;
}
