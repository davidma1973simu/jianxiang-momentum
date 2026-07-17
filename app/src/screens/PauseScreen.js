// 见象 Momentum · 大象暂停法（P0 镜子核心）
// 停（息屏+震动+一声钵响+"大象来了"）→ 看（身体部位）→ 问（需求标签）
// → 活人话淡显 →「这句话触动了我」（一声涟漪）
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import Grassland, { PlacedElephant } from '../components/Grassland';
import { colors, font, space, motion } from '../theme/tokens';
import { NEED_TAGS, BODY_PARTS, phraseFor, TOUCH_ECHO } from '../data/phrases';
import { addMoment, markTouched, getSettings, Phase } from '../data/store';
import { play } from '../sound/soundscape';
import { enterFlight, exitFlight } from '../flight/flight';

// 阶段：1 停 → 1.5 息屏 → 2 看 → 3 问 → 4 语言转换
export default function PauseScreen({ onExit, onEnterPrairie, onEnterFour, onEnterHelp, flight = false }) {
  const [stage, setStage] = useState(1);
  const [bodyIdx, setBodyIdx] = useState(null);
  const [needTag, setNeedTag] = useState(null);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [touched, setTouched] = useState(0);
  const [recordId, setRecordId] = useState(null);
  const [flightOn, setFlightOn] = useState(false);
  const hapticOn = useRef(true);

  const dimOp = useRef(new Animated.Value(0)).current;
  const stopWordOp = useRef(new Animated.Value(0)).current;
  const stopSubOp = useRef(new Animated.Value(0)).current;
  const contentOp = useRef(new Animated.Value(0)).current;
  const dimTimer = useRef(null);

  useEffect(() => {
    let on = false;
    getSettings().then((s) => {
      hapticOn.current = s.hapticOn;
      // 专注模式只在使用者主动选择“飞一会儿”或手动开启全局开关时才启用，不再默认强制
      on = flight || !!s.flightAuto;
      setFlightOn(on);
      if (on) enterFlight(); // 最佳努力屏蔽系统通知（真机生效）
    });
    fadeIn();
    return () => {
      clearTimeout(dimTimer.current);
      exitFlight(); // 离开暂停法即恢复外界
    };
  }, []);

  function fadeIn() {
    // 不再把 opacity 重置为 0：新阶段挂载时若重置，
    // 在原生驱动下可能出现“新视图没接到动画”而一直空白。
    // 这里只做“确认到 1”的淡入，切换即显。
    Animated.timing(contentOp, { toValue: 1, duration: motion.base, useNativeDriver: true }).start();
  }

  // ===== 停 → 息屏 =====
  function doStop() {
    if (stage !== 1) return;
    setStage(1.5);
    // 息屏那一刻：一声温暖钵响 + 轻震动（物理层与听觉层一起把人接住）
    play('stop');
    if (hapticOn.current) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    Animated.timing(dimOp, { toValue: 1, duration: motion.slow, useNativeDriver: true }).start();
    Animated.timing(stopWordOp, { toValue: 0.92, duration: motion.base, useNativeDriver: true }).start();
    Animated.timing(stopSubOp, {
      toValue: 0.82,
      duration: 1200,
      delay: 800,
      useNativeDriver: true,
    }).start();
    dimTimer.current = setTimeout(() => {
      Animated.timing(dimOp, { toValue: 0, duration: motion.slow, useNativeDriver: true }).start(() => {
        stopWordOp.setValue(0);
        stopSubOp.setValue(0);
        setStage(2);
        fadeIn();
      });
    }, motion.dim);
  }

  // ===== 看 =====
  function pickBody(i) {
    if (stage !== 2) return;
    setBodyIdx(i);
    setTimeout(() => {
      setStage(3);
      fadeIn();
    }, 320);
  }

  function skipBody() {
    if (stage !== 2 || bodyIdx !== null) return;
    // 点空白处跳过 = “说不上来”，同样合法
    setBodyIdx(null);
    setTimeout(() => {
      setStage(3);
      fadeIn();
    }, 180);
  }

  // ===== 问 =====
  async function pickNeed(t) {
    if (stage !== 3) return;
    setNeedTag(t);
    // 只存枚举，绝不存文本
    const rec = await addMoment({
      phase: Phase.PAUSE,
      tag: t,
      bodyPart: bodyIdx,
      phraseTouched: false,
      phraseIndex: phraseIdx, // 保存当时显示的是第几句，后续可在草原展开
    });
    setRecordId(rec.id);
    setTimeout(() => {
      setStage(4);
      fadeIn();
    }, 320);
  }

  // ===== 语言转换 =====
  function nextPhrase() {
    setPhraseIdx((i) => i + 1);
    contentOp.setValue(0.2);
    Animated.timing(contentOp, { toValue: 1, duration: motion.fast, useNativeDriver: true }).start();
  }

  function onTouch() {
    setTouched((c) => c + 1);
    play('touch'); // 极轻涟漪回应（非奖励音）
    if (recordId) markTouched(recordId, { phraseIndex: phraseIdx });
  }

  function replay() {
    setStage(1);
    setBodyIdx(null);
    setNeedTag(null);
    setPhraseIdx(0);
    setTouched(0);
    setRecordId(null);
    dimOp.setValue(0);
    fadeIn();
  }

  return (
    <View style={styles.root}>
      <Grassland light="day">
        <PlacedElephant x={90} y={380} scale={1.0} variant="heavy" />
        <PlacedElephant x={280} y={540} scale={0.42} variant="calm" />
      </Grassland>

      {/* 停：整屏可点 */}
      {stage === 1 && (
        <Pressable style={StyleSheet.absoluteFill} onPress={doStop}>
          <Animated.View style={[styles.stage, { opacity: contentOp }]} pointerEvents="none">
            <View style={styles.stageInner}>
              <Text style={styles.caption}>① 觉察 · 不逃避</Text>
              <Text style={styles.step}>
                先停一下。{'\n'}不用解决、不用硬扛，就停三秒。{'\n'}
                <Text style={styles.hint}>在心里说一句：大象来了</Text>
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      )}

      {/* 息屏暗场 */}
      <Animated.View style={[styles.dim, { opacity: dimOp }]} pointerEvents="none">
        <Animated.Text style={[styles.stopWord, { opacity: stopWordOp }]}>停</Animated.Text>
        <Animated.Text style={[styles.stopSub, { opacity: stopSubOp }]}>
          大象来了，不是问题，是课题。
        </Animated.Text>
      </Animated.View>

      {/* 看：身体部位（空白处点击 = 跳过/说不上来） */}
      {stage === 2 && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={skipBody} />
          <Animated.View style={[styles.stage, { opacity: contentOp }]} pointerEvents="box-none">
            <View style={styles.stageInner}>
              <Text style={styles.caption}>② 理解 · 看见大象</Text>
              <Text style={styles.step}>身体哪里有点紧？{'\n'}不用想太多，点到就行。</Text>
              <View style={styles.chips}>
                {BODY_PARTS.map((b, i) => (
                  <Chip key={b} label={b} lit={bodyIdx === i} onPress={() => pickBody(i)} />
                ))}
              </View>
            </View>
          </Animated.View>
        </>
      )}

      {/* 问：需求标签 */}
      {stage === 3 && (
          <Animated.View style={[styles.stage, { opacity: contentOp }]}>
          <View style={styles.stageInner}>
            <Text style={styles.caption}>③ 主动行动 · 说出口</Text>
            <Text style={styles.step}>你这会儿，其实在求什么？{'\n'}选一个最接近的。</Text>
            <View style={styles.chips}>
              {NEED_TAGS.map((n) => (
                <Chip key={n.tag} label={n.label} lit={needTag === n.tag} onPress={() => pickNeed(n.tag)} />
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* 语言转换：空白处点击回草原；卡片/按钮自身可交互 */}
      {stage === 4 && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onEnterPrairie}>
          <Animated.View style={[styles.stage4, { opacity: contentOp }]}>
            {/* 顶部：短语 + 触动 + 收尾反馈 */}
            <View style={styles.stage4Top}>
              <View style={styles.phraseCard}>
                {touched === 0 ? (
                  <>
                    <Text style={styles.phrase}>{phraseFor(needTag, phraseIdx)}</Text>
                    <Pressable onPress={onTouch} hitSlop={10}>
                      <Text style={styles.touch}>这句话，有碰到你吗？</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={styles.phrase}>{TOUCH_ECHO[Math.min(touched - 1, TOUCH_ECHO.length - 1)]}</Text>
                )}
              </View>
              {touched === 0 && (
                <Pressable onPress={nextPhrase} hitSlop={10}>
                  <Text style={styles.alt}>不对味？再换一句</Text>
                </Pressable>
              )}

              {/* 收尾反馈：点明刚走完的一轮向内求（心念→语言→行动） */}
              <Text style={styles.reflection}>
                你刚走完一轮向内求：{'\n'}心里觉察了 → 把需求说出了口 → 没绕开。
              </Text>
            </View>

            {/* 底部：深度工具入口（主动拉杠杆才出现）+ 操作 */}
            <View style={styles.stage4Bottom}>
              <View style={styles.deepEntries}>
                <Pressable onPress={onEnterFour} hitSlop={10}>
                  <Text style={styles.deepText}>这头有点大，拆一拆？</Text>
                </Pressable>
                <View style={styles.deepDot} />
                <Pressable onPress={onEnterHelp} hitSlop={10}>
                  <Text style={styles.deepText}>想向外抓，先照一眼</Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Pressable onPress={replay} hitSlop={10}>
                  <Text style={styles.footerText}>↺ 再来一次</Text>
                </Pressable>
                <Pressable onPress={onEnterPrairie} hitSlop={10}>
                  <Text style={styles.footerText}>回到草原</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      )}

      {flightOn && (
        <View style={styles.flightBar} pointerEvents="none">
          <Text style={styles.flightText}>飞行模式 · 这片刻只属于你</Text>
        </View>
      )}
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
  caption: {
    fontSize: 13,
    color: colors.accent,
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.9,
  },
  step: { ...font.step, textAlign: 'center' },
  hint: { color: colors.inkSoft, fontSize: 15 },
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
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.dim,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  stopWord: { ...font.stop, paddingLeft: 18 },
  stopSub: { marginTop: 20, fontSize: 16, color: colors.dimText, letterSpacing: 1 },
  stage4: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8%',
    paddingHorizontal: 24,
    paddingBottom: 260, // 把深度入口和操作往上抬到大象头上方，避开底部遮挡
  },
  stage4Top: { alignItems: 'center', width: '100%' },
  stage4Bottom: { alignItems: 'center', width: '100%' },
  phraseCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    width: '100%',
  },
  phrase: { ...font.phrase },
  touch: { marginTop: 14, fontSize: 13, color: colors.inkSoft, textAlign: 'right', letterSpacing: 0.5 },
  alt: { marginTop: 18, fontSize: 14, color: colors.inkSoft, opacity: 0.75, textAlign: 'center' },
  reflection: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    color: colors.inkSoft,
    lineHeight: 22,
    opacity: 0.92,
  },
  deepEntries: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  deepText: {
    fontSize: 13,
    color: '#4A6B3E', // 深绿，提示「向深处走」的入口
    letterSpacing: 0.4,
  },
  deepDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4A6B3E',
    opacity: 0.55,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 24, // 让「再来一次/回到草原」不和全局底栏贴在一起
  },
  footerText: { fontSize: 13, color: colors.inkSoft, letterSpacing: 0.7 },
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
  lightBar: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  lightText: {
    fontSize: 12,
    color: colors.inkSoft,
    letterSpacing: 1,
    opacity: 0.7,
  },
});
