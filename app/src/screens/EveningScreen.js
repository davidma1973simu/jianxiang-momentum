// 见象 Momentum · 内心感受
// 1 滑块（平淡 → 充盈）+ 基于今日记录的活人话总结。只存整数，不上传文本。
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, PanResponder, Dimensions } from 'react-native';
import Grassland from '../components/Grassland';
import { colors, font, space, motion } from '../theme/tokens';
import { Phase, addMoment, getTodayMoments } from '../data/store';
import { play } from '../sound/soundscape';

const { width } = Dimensions.get('window');
const TRACK_PAD = 40;
const TRACK_W = width - TRACK_PAD * 2;

// 三档：充盈（≥75）/ 进步（50-75）/ 平淡（<50）—— 都是中性正向的活人话
const SUMMARIES = {
  full: [
    '今天像一片云，撑得满满，又轻轻的。',
    '草原今天很宽，你撑住了自己，也接住了它。',
    '今天是你挺舒展的样子——不装，也不撑。',
  ],
  progress: [
    '今天有过不太平的，但都走过来了。',
    '不算轻松，但一直在走。这就够了。',
    '大象来过，也走过了——你没有被它困住。',
  ],
  plain: [
    '今天比较平，没什么大事。',
    '平淡的日子也是好日子——不用非得起浪。',
    '安安静静一天，也是一种养。',
  ],
};

function eveningSummary(value, today) {
  const paused = today.filter((m) => m.phase === Phase.PAUSE).length;
  const touched = today.some((m) => m.phase === Phase.PAUSE && m.phraseTouched);
  const dawn = today.find((m) => m.phase === Phase.DAWN);
  let bucket = 'progress';
  if (value >= 75) bucket = 'full';
  else if (value < 50) bucket = 'plain';

  const base = SUMMARIES[bucket][(today.length + value) % SUMMARIES[bucket].length];
  let tail = '';
  if (paused > 0) {
    tail = touched
      ? ' 今天你停下来了，也听见了自己一句话。'
      : ' 今天你停下来了，这就很好。';
  } else if (dawn) {
    tail = ' 今天你选了一个起点，这就够了。';
  }
  return base + tail;
}

export default function EveningScreen({ onExit }) {
  const [value, setValue] = useState(50);
  const [committed, setCommitted] = useState(false);
  const [summary, setSummary] = useState('');
  const contentOp = useRef(new Animated.Value(0)).current;
  const thumbLeft = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeIn();
  }, []);

  function fadeIn() {
    contentOp.setValue(0);
    Animated.timing(contentOp, { toValue: 1, duration: motion.base, useNativeDriver: true }).start();
  }

  const moveTo = useCallback((x) => {
    const clamped = Math.max(0, Math.min(1, x / TRACK_W));
    const next = Math.round(clamped * 100);
    setValue(next);
    thumbLeft.setValue(clamped * TRACK_W);
  }, [thumbLeft]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => moveTo(e.nativeEvent.locationX),
      onPanResponderMove: (e) => moveTo(e.nativeEvent.locationX),
      onPanResponderRelease: () => {},
    })
  ).current;

  async function commit() {
    if (committed) return;
    setCommitted(true);
    play('touch');
    await addMoment({ phase: Phase.DUSK, value });
    const today = await getTodayMoments();
    setSummary(eveningSummary(value, today));
    fadeIn();
  }

  return (
    <View style={styles.root}>
      <Grassland light="dusk" />

      <Animated.View style={[styles.stage, { opacity: contentOp }]}>
        {!committed ? (
          <View style={styles.stageInner}>
            <Text style={styles.step}>
              今天过得怎么样？{'\n'}滑一下，不用很准。
            </Text>

            <View style={styles.sliderBox}>
              <View style={styles.labels}>
                <Text style={styles.labelText}>平淡</Text>
                <Text style={styles.labelText}>充盈</Text>
              </View>
              <View
                style={styles.track}
                {...panResponder.panHandlers}
                onLayout={(e) => {
                  // 初始 thumb 位置
                  thumbLeft.setValue((value / 100) * e.nativeEvent.layout.width);
                }}
              >
                <View style={[styles.fill, { width: `${value}%` }]} />
                <Animated.View style={[styles.thumb, { left: thumbLeft }]} />
              </View>
            </View>

            <Pressable onPress={commit} hitSlop={12} style={styles.commit}>
              <Text style={styles.commitText}>就这了</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stageInner}>
            <Text style={styles.summary}>{summary}</Text>
            <Text style={styles.soft}>今晚的草原，先到这里。</Text>
            <Pressable onPress={onExit} hitSlop={12}>
              <Text style={styles.doneText}>回到草原</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  stage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  stageInner: {
    alignItems: 'center',
    marginTop: -40,
    width: '100%',
  },
  step: { ...font.step, textAlign: 'center' },
  sliderBox: {
    width: '100%',
    marginTop: space.xxl,
    marginBottom: space.lg,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: TRACK_PAD,
    marginBottom: 10,
  },
  labelText: { ...font.soft, fontSize: 13 },
  track: {
    height: 44,
    marginHorizontal: TRACK_PAD,
    borderRadius: 22,
    backgroundColor: colors.chip,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(217,176,140,0.45)',
  },
  thumb: {
    position: 'absolute',
    top: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    marginLeft: -16,
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  commit: {
    marginTop: space.xxl,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: colors.chip,
  },
  commitText: { fontSize: 15, color: colors.ink, letterSpacing: 0.5 },
  summary: {
    ...font.phrase,
    textAlign: 'center',
    lineHeight: 34,
    paddingHorizontal: space.md,
  },
  soft: {
    ...font.soft,
    marginTop: space.lg,
    opacity: 0.8,
  },
  doneText: {
    marginTop: space.xxl,
    fontSize: 14,
    color: colors.inkSoft,
    letterSpacing: 0.7,
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
