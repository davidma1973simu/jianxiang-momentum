// 见象 Momentum · 声景层（Soundscape）
// 铁律（见 PRD §4.5）：点睛的单声，默认极轻、可整体静音、一声即止；
// 绝不循环、绝不铺底、绝不连播；绝无通知/成就/奖励音。
// BGM：背景音乐默认极低音量，用户可在设置中关闭。
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { getSettings } from '../data/store';

// 声音清单 —— 只有两个关键锚点会响 + BGM
const SOURCES = {
  // 停/息屏：低频温暖钵响（听觉版"大象来了"）
  stop: require('../../assets/sound/stop-bowl.wav'),
  // 触动了我：极轻涟漪回应（非奖励"叮"）
  touch: require('../../assets/sound/touch-ripple.wav'),
};

const BGM_VOLUME = 0.22; // BGM 低音量（用户要求降低10%），不喧宾夺主

// 默认音量极低 —— 视觉才是主通道，声音只是草原的回声
const VOLUME = {
  stop: 0.55,
  touch: 0.4,
};

let players = {};
let bgmPlayer = null;
let bgmLoaded = false;
let ready = false;
let muted = false; // 内存态镜像全局静音开关

export async function initSoundscape() {
  if (ready) return;
  try {
    // 尊重系统静音键；不抢占其他音频
    await setAudioModeAsync({
      playsInSilentMode: false,
      shouldRouteThroughEarpiece: false,
    });
    for (const key of Object.keys(SOURCES)) {
      const p = createAudioPlayer(SOURCES[key]);
      p.volume = VOLUME[key];
      players[key] = p;
    }
    // 加载 BGM 但不自动播放（由 startBGM 触发）
    try {
      bgmPlayer = createAudioPlayer(require('../../assets/sound/bg-music.mp3'));
      bgmPlayer.volume = BGM_VOLUME;
      bgmPlayer.loop = true;
      bgmLoaded = true;
    } catch (e) {
      // BGM 加载失败不影响核心体验
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
    p.seekTo(0);
    p.play();
  } catch (e) {
    // 静默失败
  }
}

// 启动 BGM（花之圆舞曲原版，先预下载到内存再播放，消除网络卡顿）
export function startBGM() {
  if (muted || !bgmPlayer || !bgmLoaded) return;
  try {
    // Web: 先用 fetch 把整个 MP3 下载到内存，转成 Blob URL 再播
    // 这样播的是本地内存数据，不依赖网络，不会断断续续
    const uri = bgmPlayer.src?.uri;
    if (typeof window !== 'undefined' && window.fetch && window.URL && uri) {
      fetch(uri)
        .then((r) => r.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          bgmPlayer.replace({ uri: blobUrl });
          bgmPlayer.volume = BGM_VOLUME;
          bgmPlayer.loop = true;
          bgmPlayer.play();
        })
        .catch(() => {
          // 降级：直接从网络播
          bgmPlayer.play();
        });
      return;
    }
    // 非 Web 环境直接播
    bgmPlayer.play();
  } catch (e) {
    // 静默失败
  }
}

// 停止 BGM
export function stopBGM() {
  if (!bgmPlayer || !bgmLoaded) return;
  try {
    bgmPlayer.pause();
  } catch (e) {}
}

// 全局静音开关（与设置联动）
export function setMuted(v) {
  muted = !!v;
  if (muted) stopBGM();
}

export function isMuted() {
  return muted;
}

export function disposeSoundscape() {
  stopBGM();
  for (const key of Object.keys(players)) {
    try {
      players[key].remove();
    } catch (e) {}
  }
  players = {};
  if (bgmPlayer) {
    try { bgmPlayer.remove(); } catch (e) {}
    bgmPlayer = null;
  }
  bgmLoaded = false;
  ready = false;
}
