// 见象 Momentum · 首屏 · 草原
// 点大象 = 有事儿（进暂停法）；点晴空/草地 = 今天还行（"今天草原挺清亮的"）
// Minimal Chrome：无按钮、无箭头、无框；草原本身就是导航。
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Grassland, { PlacedElephant } from '../components/Grassland';
import { colors, font, space } from '../theme/tokens';

export default function HomeScreen({ onEnterPause, onEnterMorning, onEnterEvening, onEnterFlight, onEnterPrairie }) {
  const [fine, setFine] = useState(false);
  const breathe = useRef(new Animated.Value(0.45)).current;
  const fineOp = useRef(new Animated.Value(0)).current;
  const fineTimer = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 0.85, duration: 1700, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0.45, duration: 1700, useNativeDriver: true }),
      ])
    ).start();
    return () => clearTimeout(fineTimer.current);
  }, []);

  function showFine() {
    clearTimeout(fineTimer.current);
    setFine(true);
    Animated.timing(fineOp, { toValue: 0.85, duration: 600, useNativeDriver: true }).start();
    fineTimer.current = setTimeout(() => {
      Animated.timing(fineOp, { toValue: 0, duration: 500, useNativeDriver: true }).start(() =>
        setFine(false)
      );
    }, 2200);
  }

  return (
    <View style={styles.root}>
      {/* 背景热区：点空白/草地 = 今天还行。Grassland 自身 pointerEvents=none，触摸落到此 Pressable。 */}
      <Pressable style={StyleSheet.absoluteFill} onPress={showFine}>
        <Grassland light="day">
          {/* 主角大象（草地中央偏左） */}
          <PlacedElephant x={90} y={440} scale={0.9} variant="calm" />
          {/* 远处同伴象 */}
          <PlacedElephant x={250} y={388} scale={0.3} opacity={0.8} />
          <PlacedElephant x={300} y={398} scale={0.24} opacity={0.68} />
          <PlacedElephant x={336} y={393} scale={0.28} opacity={0.74} />
        </Grassland>
      </Pressable>

      {/* 主角大象点击热区（盖在它上方）：点它 = 有事儿 → 暂停法 */}
      <Pressable
        style={styles.eleHot}
        onPress={onEnterPause}
        hitSlop={16}
        accessibilityLabel="心里有点堵，碰碰大象"
      />

      {/* 文案 */}
      <View style={styles.lead} pointerEvents="none">
        <Text style={styles.leadText}>
          每个人眼前，{'\n'}都有一片草原。{'\n'}
          <Text style={styles.leadStrong}>偶尔，会冒出一头大象。</Text>
        </Text>
      </View>

      <Text style={styles.subtitle} pointerEvents="none">
        见象陪你向内求——{'\n'}把心里堵，变成扩容心量的机会。
      </Text>

      <Animated.Text style={[styles.tap, { opacity: breathe }]} pointerEvents="none">
        心里有点堵？碰碰它看看
      </Animated.Text>

      <Text style={styles.motto} pointerEvents="none">
        不是解决，是共处。{'\n'}不是硬扛，是借力。{'\n'}不是罪名，是课题。
      </Text>

      {fine && (
        <Animated.Text style={[styles.fine, { opacity: fineOp }]} pointerEvents="none">
          🍃 今天草原挺清亮的
        </Animated.Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  // 主角象点击热区，对应场景 translate(90 440) scale(.9) 的屏幕位置（百分比自适应）
  eleHot: {
    position: 'absolute',
    left: '16%',
    top: '54%',
    width: '46%',
    height: '26%',
    zIndex: 6,
  },
  lead: { position: 'absolute', top: 100, left: 0, right: 0, paddingHorizontal: space.xl, zIndex: 10 },
  leadText: { ...font.lead, textAlign: 'center' },
  leadStrong: { fontWeight: '500', color: colors.ink },
  subtitle: {
    position: 'absolute',
    top: 214,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    color: colors.inkSoft,
    opacity: 0.95,
    lineHeight: 24,
    paddingHorizontal: space.lg,
    zIndex: 10,
  },
  tap: {
    position: 'absolute',
    bottom: 360,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    color: colors.inkSoft,
    letterSpacing: 0.7,
    zIndex: 10,
  },
  motto: {
    position: 'absolute',
    top: 300,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    color: colors.inkSoft,
    opacity: 0.6,
    lineHeight: 20,
    letterSpacing: 0.4,
    zIndex: 10,
  },
  fine: {
    position: 'absolute',
    bottom: 330,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    color: colors.inkSoft,
    zIndex: 15,
  },
  timeEntries: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    zIndex: 12,
    flexWrap: 'wrap',
  },
  timeEntry: {
    fontSize: 13,
    color: colors.ink,
    opacity: 0.85,
    letterSpacing: 0.8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  brand: {
    position: 'absolute',
    top: 26,
    left: 0,
    right: 0,
    textAlign: 'center',
    ...font.brand,
    opacity: 0.55,
    zIndex: 30,
  },
});
