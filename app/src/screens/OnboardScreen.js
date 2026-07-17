// 见象 Momentum · 首次引导（仅首次，可跳过）
// 这里承担「价值显化 + 5 步脊柱 + 三层改变」的清晰教学，
// 用隐喻 + 活人话准确表述，不喧宾夺主；之后各屏只轻点。
// 点选式，绝不写任何文本。
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Grassland, { PlacedElephant } from '../components/Grassland';
import { colors, font, space } from '../theme/tokens';

const STEPS = [
  { n: '觉察问题', d: '不逃避' },
  { n: '追问本质', d: '为什么' },
  { n: '理解需求', d: '看见大象' },
  { n: '主动行动', d: '学习 / 求助 / 改变' },
  { n: '扩容心量', d: '接纳无常' },
];

export default function OnboardScreen({ onDone }) {
  const [step, setStep] = useState(1);

  return (
    <View style={styles.root}>
      <Grassland light="day">
        <PlacedElephant x={120} y={560} scale={0.5} variant="calm" />
        <PlacedElephant x={250} y={600} scale={0.34} opacity={0.8} />
      </Grassland>

      {step === 1 ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>第一次来，先认识一下</Text>
          <Text style={styles.title}>见象，不解决你的问题</Text>
          <Text style={styles.body}>它陪你做一次「向内求」——</Text>
          <Text style={styles.body}>把每次心里堵，变成一次看清自己、撑大心量的机会。</Text>
          <Text style={styles.body}>不用硬扛，也不用假装没事。</Text>

          {/* 三层改变：心念 → 语言(桥) → 行为 */}
          <View style={styles.layerBox}>
            <Text style={styles.layerTitle}>向内求，是三层一起转：</Text>
            <View style={styles.layerRow}>
              <Text style={styles.layerItem}>心念</Text>
              <Text style={styles.layerArrow}>→</Text>
              <View style={styles.layerBridge}>
                <Text style={styles.layerItem}>语言</Text>
                <Text style={styles.layerNote}>桥</Text>
              </View>
              <Text style={styles.layerArrow}>→</Text>
              <Text style={styles.layerItem}>行为</Text>
            </View>
            <Text style={styles.layerHint}>
              光想没用，光做也空。把心里那句话说出口，才是真转。
            </Text>
          </View>

          <Pressable style={styles.primary} onPress={() => setStep(2)} hitSlop={8}>
            <Text style={styles.primaryText}>那具体怎么走？</Text>
          </Pressable>
          <Pressable style={styles.skip} onPress={onDone} hitSlop={8}>
            <Text style={styles.skipText}>先随便看看</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>向内求，是这么走的一圈</Text>
          <Text style={styles.title}>五步，不用一次走完</Text>

          <View style={styles.steps}>
            {STEPS.map((s, i) => (
              <View key={s.n} style={styles.stepRow}>
                <View style={styles.rail}>
                  <View style={styles.dot} />
                  {i < STEPS.length - 1 && <View style={styles.railLine} />}
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepName}>{`${i + 1}. ${s.n}`}</Text>
                  <Text style={styles.stepDesc}>{s.d}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.body}>记不住没关系，用着用着就懂了。</Text>
          <Text style={styles.body}>每次只走一小步，草原会替你记得。</Text>

          <Pressable style={styles.primary} onPress={onDone} hitSlop={8}>
            <Text style={styles.primaryText}>开始我的草原</Text>
          </Pressable>
          <Pressable style={styles.skip} onPress={onDone} hitSlop={8}>
            <Text style={styles.skipText}>先随便看看</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* 进度小圆点 */}
      <View style={styles.dots} pointerEvents="none">
        <View style={[styles.dotSm, step === 1 && styles.dotSmOn]} />
        <View style={[styles.dotSm, step === 2 && styles.dotSmOn]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollInner: {
    paddingTop: 96,
    paddingHorizontal: 28,
    paddingBottom: 120,
    alignItems: 'center',
  },
  kicker: {
    fontSize: 13,
    color: colors.inkSoft,
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 23,
    color: colors.ink,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 18,
  },
  body: {
    ...font.step,
    textAlign: 'center',
    color: colors.inkSoft,
    lineHeight: 28,
    marginBottom: 26,
  },
  // 三层
  layerBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
  },
  layerTitle: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: 14,
    textAlign: 'center',
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  layerItem: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: '500',
  },
  layerArrow: { fontSize: 18, color: colors.accent },
  layerBridge: {
    alignItems: 'center',
    backgroundColor: 'rgba(217,176,140,0.16)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  layerNote: {
    fontSize: 11,
    color: colors.accent,
    marginTop: 2,
  },
  layerHint: {
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 20,
  },
  // 五步
  steps: {
    width: '100%',
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rail: {
    width: 16,
    alignItems: 'center',
    marginRight: 14,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.accent,
    marginTop: 5,
  },
  railLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(217,176,140,0.4)',
    marginTop: 2,
    marginBottom: 2,
    minHeight: 22,
  },
  stepText: {
    flex: 1,
    paddingBottom: 18,
  },
  stepName: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 13.5,
    color: colors.inkSoft,
    lineHeight: 20,
  },
  // 按钮
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 6,
  },
  primaryText: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.6,
  },
  skip: {
    marginTop: 14,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    color: colors.inkSoft,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  dots: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dotSm: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(146,139,126,0.35)',
  },
  dotSmOn: { backgroundColor: colors.accent },
});
