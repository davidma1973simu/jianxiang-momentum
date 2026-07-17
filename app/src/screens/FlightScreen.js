// 见象 Momentum · 飞行模式入口（专注断联）
// 一处安静的起手式：让你先决定"这片刻只属于我"，再进入暂停法。
// Minimal Chrome：无按钮框、无箭头；一句软话 + 两个轻触文字。
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Grassland from '../components/Grassland';
import { colors, font, space, motion } from '../theme/tokens';
import { getTodayMoments, Phase } from '../data/store';

const TOPIC_TEXT = {
  感受: { step: '今天早上，你选了「我的感受」。', soft: '飞这片刻，先让外界停一停，感受才会浮出来。' },
  小事: { step: '今天早上，你选了「一件小事」。', soft: '先把这件小事放一放，回来再拿，它会等你。' },
  关系: { step: '今天早上，你选了「一个关系」。', soft: '这段关系，值得你用这片刻先回到自己。' },
};

export default function FlightScreen({ onStart, onExit }) {
  const contentOp = useRef(new Animated.Value(0)).current;
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    contentOp.setValue(0);
    Animated.timing(contentOp, { toValue: 1, duration: motion.base, useNativeDriver: true }).start();
    getTodayMoments().then((today) => {
      const dawn = today.find((m) => m.phase === Phase.DAWN);
      if (dawn && dawn.tag) setTopic(dawn.tag);
    });
  }, []);

  const text = topic ? TOPIC_TEXT[topic] : {
    step: '要不要，\n先让外界停一停？',
    soft: '微信、邮件、待办…\n这片刻先放一放，\n回来再处理也不迟。',
  };

  return (
    <View style={styles.root}>
      <Grassland light="dusk">
        <Animated.View style={[styles.glow, { opacity: contentOp }]} pointerEvents="none" />
      </Grassland>

      <Animated.View style={[styles.stage, { opacity: contentOp }]}>
        <View style={styles.stageInner}>
          <Text style={styles.step}>{text.step}</Text>
          <Text style={styles.soft}>{text.soft}</Text>

          <View style={styles.actions}>
            <Pressable onPress={onStart} hitSlop={12}>
              <Text style={styles.primary}>开始这片刻</Text>
            </Pressable>
            <Pressable onPress={onExit} hitSlop={12}>
              <Text style={styles.ghost}>先不飞了</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(169,190,210,0.12)',
  },
  stage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  stageInner: {
    alignItems: 'center',
    marginTop: -30,
  },
  step: { ...font.step, textAlign: 'center' },
  soft: {
    ...font.soft,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: space.lg,
    opacity: 0.85,
  },
  actions: {
    marginTop: space.xxl,
    alignItems: 'center',
    gap: 18,
  },
  primary: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 24,
    letterSpacing: 0.6,
  },
  ghost: {
    fontSize: 13,
    color: colors.inkSoft,
    letterSpacing: 0.6,
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
