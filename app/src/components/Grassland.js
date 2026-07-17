// 见象 Momentum · 草原场景（草原=我们面对的整个世界）
// 天空渐变 + 远近山丘 + 草坡；接收 children 放置大象/道具。极简、无框、无线。
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G, Ellipse } from 'react-native-svg';
import Elephant from './Elephant';
import { colors } from '../theme/tokens';

export const SCENE_W = 392;
export const SCENE_H = 760;

// 放置一头大象：translate + scale
export function PlacedElephant({ x, y, scale = 1, variant = 'calm', opacity = 1 }) {
  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <Elephant variant={variant} />
    </G>
  );
}

export default function Grassland({ children, light = 'day' }) {
  // light 光态：'day' 晴 | 'dawn' 黎明 | 'dusk' 黄昏（微调天色）
  const sky = LIGHTS[light] || LIGHTS.day;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={sky.top} />
            <Stop offset="0.4" stopColor={sky.mid} />
            <Stop offset="0.62" stopColor={colors.grass} />
            <Stop offset="1" stopColor={colors.grassDeep} />
          </LinearGradient>
        </Defs>

        {/* 天空 + 草原底 */}
        <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill="url(#sky)" />

        {/* 远近山丘与草坡 */}
        <Path d="M0 300 Q90 250 180 295 T392 285 L392 360 L0 360 Z" fill={colors.hillFar} opacity={0.7} />
        <Path d="M0 430 Q120 380 220 425 T392 410 L392 520 L0 520 Z" fill={colors.hillNear} />
        <Path d="M0 470 Q140 440 260 478 T392 470 L392 760 L0 760 Z" fill={colors.grass} />
        <Path d="M0 560 Q160 525 300 565 T392 555 L392 760 L0 760 Z" fill={colors.grassDeep} />

        {/* 云 */}
        <G fill={colors.cloud} opacity={0.25}>
          <Ellipse cx={300} cy={170} rx={46} ry={20} />
          <Ellipse cx={330} cy={160} rx={34} ry={16} />
        </G>

        {/* 草丛点缀 */}
        <G stroke={colors.grassStroke} strokeWidth={2.4} strokeLinecap="round" opacity={0.8} fill="none">
          <Path d="M70 720 q4 -16 0 -28 M76 722 q10 -12 14 -24 M64 722 q-8 -10 -10 -22" />
          <Path d="M320 710 q4 -16 0 -28 M326 712 q10 -12 14 -24 M314 712 q-8 -10 -10 -22" />
        </G>

        {children}
      </Svg>
    </View>
  );
}

const LIGHTS = {
  day: { top: colors.sky, mid: colors.hillFar },
  dawn: { top: '#F3E9DE', mid: '#E4D9C6' },
  dusk: { top: '#EDE2D6', mid: '#D8CDBA' },
};
