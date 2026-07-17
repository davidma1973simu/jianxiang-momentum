// 见象 Momentum · 我的草原（数据留存与反馈层）
// 重构为「今日见象」日记本：封面有日期 + 大象（按晚间得分变色），
// 按下展开当天最多 3 个脚印的描述性叙事（不直接罗列枚举）。
// 只展示本地枚举记录，不展示任何用户输入文本。记录只留在本地。
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, SafeAreaView } from 'react-native';
import Svg from 'react-native-svg';
import Grassland from '../components/Grassland';
import Elephant from '../components/Elephant';
import { colors, font, space } from '../theme/tokens';
import { getMoments, Phase } from '../data/store';
import { phraseFor } from '../data/phrases';
import { fourSummary, helpConclusion } from '../data/deep';

const dayMs = 86400000;

function toDateKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(ts) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
function weekdayOf(key) {
  const d = new Date(key + 'T00:00:00');
  return '周' + WEEK[d.getDay()];
}

function formatDateLabel(key) {
  const todayKey = toDateKey(Date.now());
  const yesterdayKey = toDateKey(Date.now() - dayMs);
  if (key === todayKey) return '今天';
  if (key === yesterdayKey) return '昨天';
  const d = new Date(key + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function scoreLabel(value) {
  if (value >= 72) return '还好';
  if (value <= 28) return '好难';
  return '一般';
}

// 大象配色：随晚间复盘得分变化（轻松偏草绿、紧绷偏紫灰、中等默认蓝灰）
function eleTint(value) {
  if (value == null) return { color: colors.ele, deep: colors.eleDeep };
  if (value >= 72) return { color: '#BBD3B8', deep: '#A6C2A3' };
  if (value <= 28) return { color: '#B9AEC4', deep: '#A99BB6' };
  return { color: colors.ele, deep: colors.eleDeep };
}

// 需求标签 → 描述性动词
const NEED_VERB = {
  被认可: '想要被看见',
  安全感: '想要安心',
  掌控感: '想要掌控',
  链接感: '想要靠近',
};

// 身体部位索引 → 描述
const BODY_TIGHT = ['肩膀有点紧', '胸口有点紧', '额头有点紧', '身子有点紧'];
function bodyTight(idx) {
  if (idx === null || idx === undefined) return '身子有点紧';
  return BODY_TIGHT[idx] || '身子有点紧';
}

// 晨间锚点 → 描述性一句话
function dawnText(tag) {
  if (tag === '感受') return '今天一早，你先把自己看了一眼。';
  if (tag === '小事') return '今天一早，你把注意力放在了一件小事上。';
  if (tag === '关系') return '今天一早，你留意了一个关系。';
  return '今天一早，你先停了一下。';
}

// 大象暂停法 → 描述性叙事（含被触动的活人话）
function pauseText(rec) {
  const verb = NEED_VERB[rec.tag] || '想要看清';
  const body = bodyTight(rec.bodyPart);
  const touched = rec.phraseTouched && rec.phraseIndex !== null && rec.phraseIndex !== undefined;
  if (touched) {
    const phrase = phraseFor(rec.tag, rec.phraseIndex);
    return `有只象走近了，让你${body}，你${verb}。而你最终说出了那句：「${phrase}」`;
  }
  return `有只象走近了，让你${body}，你${verb}。你停了停，没有绕开——已经很好。`;
}

// 晚间复盘 → 描述性一句话
function duskText(value) {
  return `夜里你回头看这一天，觉得：${scoreLabel(value)}。`;
}

// 四步照象 → 描述性叙事（用四步库自带的 AHA 总结）
function fourText(rec) {
  if (!rec || !rec.meta) return '你决定拆开看看这头大象。';
  const { need, firstStep } = rec.meta;
  return `这头大一点，你决定拆开看看。${fourSummary({ need, firstStep })}`;
}

// 求助过滤网 → 描述性叙事
function helpText(rec) {
  if (!rec || !rec.meta) return '想找个人问问，你照了一眼。';
  return `想找个人问问之前，你照了一眼：${helpConclusion(rec.meta)}`;
}

// 取某天脚印：晨间/暂停/晚间/四步照象/求助过滤 各取最新一条
function dayFootprints(records) {
  const latest = (phase) =>
    records
      .filter((m) => m.phase === phase)
      .sort((a, b) => a.createdAt - b.createdAt)
      .pop() || null;
  return {
    dawn: latest(Phase.DAWN),
    pause: latest(Phase.PAUSE),
    four: latest(Phase.FOUR),
    help: latest(Phase.HELP),
    dusk: latest(Phase.DUSK),
  };
}

// 把当天脚印编译成有序的描述性段落（暂停法后的深度工具紧跟其后）
function describeDay(fp) {
  const out = [];
  if (fp.dawn) out.push({ phase: 'dawn', time: fp.dawn.createdAt, text: dawnText(fp.dawn.tag) });
  if (fp.pause) out.push({ phase: 'pause', time: fp.pause.createdAt, text: pauseText(fp.pause) });
  // 四步照象 + 求助过滤：作为暂停法的"第二段产出"挂在其后
  if (fp.four) out.push({ phase: 'four', time: fp.four.createdAt, text: fourText(fp.four) });
  if (fp.help) out.push({ phase: 'help', time: fp.help.createdAt, text: helpText(fp.help) });
  if (fp.dusk) out.push({ phase: 'dusk', time: fp.dusk.createdAt, text: duskText(fp.dusk.value) });
  return out;
}

// 所得镜像：根据本地枚举记录，用活人话合成「你从向内求里得到了什么」。
// 只定性、不撒数字徽章；显化 心念→语言→行动 的转变与心量扩容。
function buildMirror(records) {
  if (!records || records.length === 0) return null;
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  const week = records.filter((r) => r.createdAt >= weekAgo);
  const anyPause = week.some((r) => r.phase === Phase.PAUSE);
  const anyTouched = records.some((r) => r.phraseTouched);
  const anyHelp = records.some((r) => r.phase === Phase.HELP);
  const anyFour = records.some((r) => r.phase === Phase.FOUR);
  const dusk = records.filter((r) => r.phase === Phase.DUSK && r.value != null);

  const parts = [];
  if (anyPause) parts.push('这阵子你停下来好几次，每一次都是一次「没逃避」。');
  if (anyTouched) parts.push('有几次，你把一个需求说出了口——那是心念，变成了语言。');
  if (anyHelp) parts.push('有几次你主动去借力、去问，那不是示弱，是向内求的一部分。');
  if (anyFour) parts.push('你还拆开看过几头大一点的象。');
  if (dusk.length >= 2) parts.push('晚间复盘里，你越来越能和它共处。');
  parts.push('心量，就是这样一点点被撑大的。');
  return parts.join('\n');
}

export default function PrairieScreen({ onExit, onShowOnboard }) {
  const [records, setRecords] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [op] = useState(new Animated.Value(0));

  useEffect(() => {
    let mounted = true;
    getMoments().then((list) => {
      if (!mounted) return;
      const recs = list.slice().reverse(); // 最新在前
      setRecords(recs);
      // 今天默认展开，历史日折叠
      setExpandedGroups({ [toDateKey(Date.now())]: true });
      Animated.timing(op, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleGroup = (key) => {
    setExpandedGroups((g) => ({ ...g, [key]: !g[key] }));
  };

  // 按日期分组（保留每个日期内部时间顺序：从早到晚，因为列表已 reverse，每组再 reverse）
  const groups = {};
  records.forEach((r) => {
    const key = toDateKey(r.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  const groupKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a)); // 日期从新到旧

  const mirror = buildMirror(records);

  return (
    <SafeAreaView style={styles.safe}>
      <Grassland light="day" />

      <Animated.View style={[styles.content, { opacity: op }]}>
        <Text style={styles.title}>你 的 草 原</Text>

        {/* 所得镜像：把用户的向内求成长合成一句活人话 */}
        {mirror && (
          <View style={styles.mirror}>
            <Text style={styles.mirrorKick}>你走过的向内求</Text>
            <Text style={styles.mirrorText}>{mirror}</Text>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          {groupKeys.length === 0 ? (
            <View style={styles.emptyJournal}>
              <JournalElephant tint={eleTint(null)} variant="calm" />
              <Text style={styles.emptyText}>今天还没留下脚印。</Text>
              <Text style={styles.emptySoft}>
                每次你停下来、看见自己、听见一句话，{'\n'}这里都会长出一页「今日见象」。
              </Text>
            </View>
          ) : (
            groupKeys.map((key) => {
              const fp = dayFootprints(groups[key]);
              const lines = describeDay(fp);
              return (
                <Journal
                  key={key}
                  dateKey={key}
                  footprints={fp}
                  lines={lines}
                  expanded={!!expandedGroups[key]}
                  onToggle={() => toggleGroup(key)}
                />
              );
            })
          )}

          <Pressable onPress={onShowOnboard} hitSlop={10} style={styles.onboardBtn}>
            <Text style={styles.onboardText}>再看一遍引导</Text>
          </Pressable>

          <Text style={styles.hint}>这些脚印只留在你的手机里，我们不会看到</Text>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function Journal({ dateKey, footprints, lines, expanded, onToggle }) {
  const dusk = footprints.dusk;
  const tint = eleTint(dusk ? dusk.value : null);
  const variant = dusk && dusk.value <= 28 ? 'heavy' : 'calm';
  const isEmpty = lines.length === 0;
  const wd = weekdayOf(dateKey);
  return (
    <View style={styles.journal}>
      <Pressable
        onPress={isEmpty ? undefined : onToggle}
        style={styles.journalCover}
        disabled={isEmpty}
      >
        <View style={styles.coverLeft}>
          <JournalElephant tint={tint} variant={variant} />
        </View>
        <View style={styles.coverMid}>
          <Text style={styles.coverDate}>{formatDateLabel(dateKey)} · {wd}</Text>
          <Text style={styles.coverTitle}>今日见象</Text>
          <Text style={styles.coverTeaser}>
            {isEmpty ? '今天还没留下脚印，去草原上走走？' : `今天留了 ${lines.length} 个脚印`}
          </Text>
        </View>
        {!isEmpty && <Text style={styles.coverArrow}>{expanded ? '⌄' : '›'}</Text>}
      </Pressable>

      {expanded && !isEmpty && (
        <View style={styles.journalBody}>
          {lines.map((l, i) => (
            <View key={i} style={styles.footLine}>
              <Text style={styles.footTime}>{formatTime(l.time)}</Text>
              <Text style={styles.footText}>{l.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function JournalElephant({ tint, variant }) {
  return (
    <Svg width={64} height={56} viewBox="0 0 240 195" preserveAspectRatio="xMidYMid meet">
      <Elephant color={tint.color} deepColor={tint.deep} variant={variant} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    color: colors.inkSoft,
    letterSpacing: 6,
    marginBottom: 16,
  },
  mirror: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(169,190,210,0.18)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
  },
  mirrorKick: {
    fontSize: 12,
    color: colors.inkSoft,
    letterSpacing: 1,
    marginBottom: 8,
  },
  mirrorText: {
    fontSize: 14.5,
    color: colors.ink,
    lineHeight: 25,
  },
  scroll: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollInner: {
    paddingTop: 4,
    paddingBottom: 120,
    alignSelf: 'stretch',
  },
  // 日记本（封面 + 展开体）
  journal: {
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  journalCover: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    shadowColor: 'rgba(107,99,88,0.10)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 1,
  },
  coverLeft: { marginRight: 14 },
  coverMid: { flex: 1 },
  coverDate: { fontSize: 12, color: colors.inkSoft, marginBottom: 4 },
  coverTitle: {
    fontSize: 18,
    color: colors.ink,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 6,
  },
  coverTeaser: { fontSize: 13, color: colors.inkSoft },
  coverArrow: { fontSize: 18, color: colors.inkSoft, marginLeft: 8 },
  journalBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 14,
  },
  footLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footTime: { fontSize: 11, color: colors.inkSoft, width: 42, marginTop: 2, opacity: 0.8 },
  footText: { flex: 1, fontSize: 14.5, color: colors.ink, lineHeight: 23 },
  // 空态
  emptyJournal: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: { ...font.step, textAlign: 'center', marginTop: 10 },
  emptySoft: { ...font.soft, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  // 重看引导
  onboardBtn: { alignItems: 'center', marginTop: 26, paddingVertical: 10 },
  onboardText: { fontSize: 13.5, color: colors.accent, letterSpacing: 0.6 },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.inkSoft,
    opacity: 0.7,
    marginTop: 18,
  },
});
