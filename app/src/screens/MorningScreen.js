// 见象 Momentum · 当下锚点
// 1 问式入口：我的感受 / 一件小事 / 一个关系。5 秒完成，只存枚举。
// 点击标签后给一句极短的正能量反馈；每天只留 1 个锚点，杜绝重复。
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Grassland from '../components/Grassland';
import { colors, font, space, motion } from '../theme/tokens';
import { Phase, addMoment, getTodayMoments } from '../data/store';
import { play } from '../sound/soundscape';

const TOPICS = [
  { tag: '感受', label: '我的感受' },
  { tag: '小事', label: '一件小事' },
  { tag: '关系', label: '一个关系' },
];

const LABEL_OF = { 感受: '我的感受', 小事: '一件小事', 关系: '一个关系' };

// 点击标签后的极短正能量反馈（与所选标签直接相关）
const FEEDBACK = {
  感受: '先看见自己的感受，今天心里就稳了一截。',
  小事: '小事被你看见了，它就不闹了。',
  关系: '愿意看一眼关系，相处会轻一点。',
};

export default function MorningScreen({ onExit }) {
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState(null);
  const [anchoredTag, setAnchoredTag] = useState(null); // 今天已锚过的标签
  const contentOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 防重复：今天已有晨间锚点则直接进入“已锚”态，不再出现第二个
    getTodayMoments().then((today) => {
      const dawn = today.find((m) => m.phase === Phase.DAWN);
      if (dawn && dawn.tag) setAnchoredTag(dawn.tag);
    });
    fadeIn();
  }, []);

  function fadeIn() {
    contentOp.setValue(0);
    Animated.timing(contentOp, { toValue: 1, duration: motion.base, useNativeDriver: true }).start();
  }

  async function pick(topic) {
    setPicked(topic.tag);
    await addMoment({ phase: Phase.DAWN, tag: topic.tag });
    play('touch');
    setTimeout(() => {
      setDone(true);
      fadeIn();
    }, 320);
  }

  return (
    <View style={styles.root}>
      <Grassland light="dawn" />

      <Animated.View style={[styles.stage, { opacity: contentOp }]}>
        {anchoredTag ? (
          <View style={styles.stageInner}>
            <Text style={styles.step}>今天已经停在这一处了：</Text>
            <Text style={styles.bigTag}>{LABEL_OF[anchoredTag]}</Text>
            <Text style={styles.soft}>明天想换一个点，再来就好。</Text>
            <Pressable onPress={onExit} hitSlop={12}>
              <Text style={styles.doneText}>回到草原</Text>
            </Pressable>
          </View>
        ) : !done ? (
          <View style={styles.stageInner}>
            <Text style={styles.step}>
            就在当下，{'\n'}第一眼看哪里？
            </Text>
            <View style={styles.chips}>
              {TOPICS.map((t) => (
                <Chip
                  key={t.tag}
                  label={t.label}
                  lit={picked === t.tag}
                  onPress={() => pick(t)}
                />
              ))}
            </View>
            <Text style={styles.soft}>随便点一个就好，就是你的当下。</Text>
          </View>
        ) : (
          <View style={styles.stageInner}>
            <Text style={styles.step}>{FEEDBACK[picked]}</Text>
            <Text style={styles.soft}>今天大象来了，我们就一起先看一眼。</Text>
            <Pressable onPress={onExit} hitSlop={12}>
              <Text style={styles.doneText}>回到草原</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function Chip({ label, lit, onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.chip, lit && styles.chipLit]}>
      <Text style={[styles.chipText, lit && styles.chipTextLit]}>{label}</Text>
    </Pressable>
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
  },
  step: { ...font.step, textAlign: 'center' },
  bigTag: {
    fontSize: 26,
    color: colors.ink,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginTop: space.xxl,
    marginBottom: space.lg,
    paddingHorizontal: space.md,
  },
  chip: {
    backgroundColor: colors.chip,
    paddingVertical: 11,
    paddingHorizontal: 19,
    borderRadius: 22,
  },
  chipLit: { backgroundColor: colors.accent },
  chipText: { ...font.chip },
  chipTextLit: { color: '#fff' },
  soft: { ...font.soft, textAlign: 'center', opacity: 0.8 },
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
