// 见象 Momentum · 全局底栏（四个入口，严格出现在每一屏）
// 让所有核心功能随时可达，避免用户卡在某一屏无法离开。
// 极简：暖底半透明、无重框、当前屏以颜色 + 小圆点标示。
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/tokens';

// 四个入口。'home' 由顶部「见象」标志承担，这里放四项核心功能。
const ITEMS = [
  { key: 'morning', label: '当下锚点' },
  { key: 'flight', label: '飞一会儿' },
  { key: 'evening', label: '内心感受' },
  { key: 'prairie', label: '我的草原' },
];

export default function BottomNav({ current, onNavigate }) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        {ITEMS.map((it) => {
          const active = current === it.key;
          return (
            <Pressable
              key={it.key}
              onPress={() => onNavigate(it.key)}
              hitSlop={8}
              style={styles.item}
              accessibilityLabel={it.label}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
              <View style={[styles.dot, active && styles.dotActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: 'rgba(245,240,235,0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(107,99,88,0.08)',
  },
  item: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12.5,
    color: colors.inkSoft,
    letterSpacing: 0.5,
  },
  labelActive: {
    color: colors.ink,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 5,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
