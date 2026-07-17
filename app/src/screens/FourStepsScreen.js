// 见象 Momentum · 四步照象（问题解剖图）
// 用户拉杠杆：暂停法化不开时，拆一拆。
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Grassland from '../components/Grassland';
import { colors, font, space, motion } from '../theme/tokens';
import { Phase, addMoment } from '../data/store';
import { FOUR_STEPS, fourSummary } from '../data/deep';
import { play } from '../sound/soundscape';

export default function FourStepsScreen({ onExit, onEnterPrairie }) {
  const [step, setStep] = useState(0); // 0..3
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState('');
  const contentOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeIn();
  }, [step, done]);

  function fadeIn() {
    contentOp.setValue(0);
    Animated.timing(contentOp, { toValue: 1, duration: motion.base, useNativeDriver: true }).start();
  }

  async function pick(option) {
    const current = FOUR_STEPS[step];
    setAnswers((a) => ({ ...a, [current.key]: option }));
    play('touch');

    if (step >= FOUR_STEPS.length - 1) {
      // 最后一步：生成小结并保存
      const final = { ...answers, [current.key]: option };
      setSummary(fourSummary({ need: final.need, firstStep: final.firstStep }));
      await addMoment({
        phase: Phase.FOUR,
        tag: final.need,
        meta: {
          appearance: final.appearance,
          ask: final.ask,
          need: final.need,
          firstStep: final.firstStep,
        },
      });
      setDone(true);
    } else {
      setTimeout(() => setStep((s) => s + 1), 280);
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  const current = FOUR_STEPS[step];

  return (
    <View style={styles.root}>
      <Grassland light="day" />

      <Animated.View style={[styles.stage, { opacity: contentOp }]}>
        {!done ? (
          <View style={styles.stageInner}>
            <Text style={styles.step}>{step + 1}. {current.question}</Text>
            <Text style={styles.hint}>{current.hint}</Text>
            <View style={styles.chips}>
              {current.options.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  lit={answers[current.key] === opt}
                  onPress={() => pick(opt)}
                />
              ))}
            </View>
            {step > 0 && (
              <Pressable onPress={back} hitSlop={10}>
                <Text style={styles.back}>← 上一步</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.stageInner}>
            <Text style={styles.summary}>{summary}</Text>
            <Text style={styles.soft}>这个拆解留在了草原上。</Text>
            <View style={styles.footer}>
              <Pressable onPress={onEnterPrairie || onExit} hitSlop={12}>
                <Text style={styles.footerText}>去草原看</Text>
              </Pressable>
              <Pressable onPress={onExit} hitSlop={12}>
                <Text style={styles.footerText}>回到首页</Text>
              </Pressable>
            </View>
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
  stageInner: { alignItems: 'center', marginTop: -40 },
  step: { ...font.step, textAlign: 'center' },
  hint: { ...font.soft, textAlign: 'center', marginTop: 8, opacity: 0.8 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginTop: space.xxl,
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
  back: { marginTop: space.xl, fontSize: 14, color: colors.inkSoft, letterSpacing: 0.6 },
  summary: { ...font.phrase, textAlign: 'center', lineHeight: 32, paddingHorizontal: space.md },
  soft: { ...font.soft, marginTop: space.lg, opacity: 0.8 },
  footer: {
    flexDirection: 'row',
    gap: 40,
    marginTop: space.xxl,
  },
  footerText: { fontSize: 14, color: colors.inkSoft, letterSpacing: 0.7 },
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
