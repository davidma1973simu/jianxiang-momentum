// 见象 Momentum · 大象 SVG（浅蓝灰、圆滚滚、闭眼、腮红、卷鼻）
// 严格复刻 M0 原型 见象Momentum-产品印象.html 的 ele-calm / ele-heavy
import React from 'react';
import { G, Ellipse, Circle, Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

// variant: 'calm' 平静 | 'heavy' 逼近（更大、眉眼微垂）
export default function Elephant({ variant = 'calm' }) {
  if (variant === 'heavy') {
    return (
      <G>
        <Ellipse cx={134} cy={160} rx={84} ry={18} fill={colors.eleShadow} opacity={0.15} />
        <Ellipse cx={78} cy={156} rx={17} ry={24} fill={colors.eleDeep} />
        <Ellipse cx={116} cy={160} rx={17} ry={24} fill={colors.eleDeep} />
        <Ellipse cx={134} cy={112} rx={82} ry={62} fill={colors.ele} />
        <Ellipse cx={160} cy={158} rx={17} ry={24} fill={colors.eleDeep} />
        <Ellipse cx={188} cy={154} rx={16} ry={22} fill={colors.eleDeep} />
        <Circle cx={68} cy={98} r={50} fill={colors.ele} />
        <Ellipse cx={34} cy={80} rx={36} ry={44} transform="rotate(-16, 34, 80)" fill={colors.eleDeep} />
        <Path d="M208 100 C224 110 224 142 210 152" fill="none" stroke={colors.eleDeep} strokeWidth={13} strokeLinecap="round" />
        <Path d="M70 126 C42 138 38 166 58 176 C70 182 82 170 74 160" fill="none" stroke={colors.eleDeep} strokeWidth={17} strokeLinecap="round" />
        {/* 微垂的闭眼 */}
        <Path d="M48 90 q8 2 16 -2" stroke="#5B554E" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path d="M84 92 q8 2 16 -2" stroke="#5B554E" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Ellipse cx={104} cy={108} rx={8} ry={5} fill={colors.blush} opacity={0.55} />
      </G>
    );
  }
  // calm
  return (
    <G>
      <Ellipse cx={132} cy={156} rx={82} ry={18} fill={colors.eleShadow} opacity={0.15} />
      <Ellipse cx={78} cy={150} rx={16} ry={22} fill={colors.eleDeep} />
      <Ellipse cx={112} cy={154} rx={16} ry={22} fill={colors.eleDeep} />
      <Ellipse cx={132} cy={104} rx={80} ry={58} fill={colors.ele} />
      <Ellipse cx={156} cy={152} rx={16} ry={22} fill={colors.eleDeep} />
      <Ellipse cx={184} cy={148} rx={15} ry={20} fill={colors.eleDeep} />
      <Circle cx={68} cy={92} r={48} fill={colors.ele} />
      <Ellipse cx={36} cy={74} rx={34} ry={42} transform="rotate(-14, 36, 74)" fill={colors.eleDeep} />
      <Path d="M206 96 C220 106 220 134 208 144" fill="none" stroke={colors.eleDeep} strokeWidth={12} strokeLinecap="round" />
      <Path d="M70 120 C44 132 38 158 56 168 C66 174 78 164 70 154" fill="none" stroke={colors.eleDeep} strokeWidth={16} strokeLinecap="round" />
      {/* 弯弯闭眼 */}
      <Path d="M48 84 q8 4 16 0" stroke="#5B554E" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <Path d="M82 86 q8 4 16 0" stroke="#5B554E" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <Ellipse cx={100} cy={100} rx={8} ry={5} fill={colors.blush} opacity={0.75} />
    </G>
  );
}
