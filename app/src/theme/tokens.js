// 见象 Momentum · 设计令牌
// 暖灰米底 #F5F0EB + 卡通治愈草原 + 极简装饰（Minimal Chrome）
// 所有颜色沿用 M0 原型 见象Momentum-产品印象.html 的调色板

export const colors = {
  // 底色系（暖灰米底，接纳不刺激）
  bg: '#F5F0EB',
  bgDeep: '#EDE7DD',
  sky: '#EFEADD',

  // 草原光态
  hillFar: '#D9D8C2',
  hillNear: '#CDD6B4',
  grass: '#C2D2A0',
  grassDeep: '#AFC78A',
  grassStroke: '#9DB879',

  // 大象（浅蓝灰、圆滚滚）
  ele: '#A9BED2',
  eleDeep: '#9AB0C6',
  eleShadow: '#8AA0B6',

  // 墨色文字
  ink: '#6B6358',
  inkSoft: '#928B7E',

  // 点缀
  blush: '#E7C3B4',
  accent: '#D9B08C',
  cloud: '#F3EFE6',

  // 息屏暗场
  dim: 'rgba(40,38,34,0.86)',
  dimText: '#F5F0EB',

  // 半透明卡片（活人话）
  card: 'rgba(255,255,255,0.66)',
  chip: 'rgba(255,255,255,0.55)',
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
};

export const radius = {
  chip: 22,
  card: 24,
  screen: 46,
};

export const font = {
  brand: { fontSize: 15, letterSpacing: 7, color: colors.inkSoft },
  lead: { fontSize: 19, lineHeight: 36, color: colors.ink },
  step: { fontSize: 17, lineHeight: 30, color: colors.ink },
  chip: { fontSize: 16, color: colors.ink },
  phrase: { fontSize: 16, lineHeight: 29, color: colors.ink },
  soft: { fontSize: 13, color: colors.inkSoft },
  stop: { fontSize: 60, letterSpacing: 18, color: colors.dimText },
};

// 动效：慢、缓动、呼吸感（300–600ms），忌弹跳
export const motion = {
  fast: 300,
  base: 500,
  slow: 900,
  dim: 3500, // 息屏停留时长（≥3 秒）
};

// 触控区 ≥ 44pt
export const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
