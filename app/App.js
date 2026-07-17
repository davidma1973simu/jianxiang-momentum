// 见象 Momentum · 应用入口
// P0 核心：草原（首屏）→ 大象暂停法。极简，无 Tab、无导航栏。
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import PauseScreen from './src/screens/PauseScreen';
import MorningScreen from './src/screens/MorningScreen';
import EveningScreen from './src/screens/EveningScreen';
import FlightScreen from './src/screens/FlightScreen';
import PrairieScreen from './src/screens/PrairieScreen';
import FourStepsScreen from './src/screens/FourStepsScreen';
import HelpFilterScreen from './src/screens/HelpFilterScreen';
import OnboardScreen from './src/screens/OnboardScreen';
import BottomNav from './src/components/BottomNav';
import { initSoundscape, startBGM } from './src/sound/soundscape';
import { colors, font } from './src/theme/tokens';
import { getSettings as getAppSettings, setSettings } from './src/data/store';

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'pause' | 'morning' | 'evening' | 'flight' | 'prairie' | 'four' | 'help'
  const [flightOn, setFlightOn] = useState(false); // 飞行上下文：进入暂停法后保持
  const [onBoard, setOnBoard] = useState(false); // 首次引导
  const [replay, setReplay] = useState(false); // 草原内重看引导（全屏覆盖）
  const [ready, setReady] = useState(false); // 设置是否已加载
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      await initSoundscape();
      const s = await getAppSettings();
      if (!s.seenOnboard) setOnBoard(true);
      setReady(true);
      // BGM 不在这里自动播，等用户首次交互后播（浏览器防自动播放策略）
    })();
  }, []);

  // 首次交互后才启动 BGM（绕过浏览器自动播放禁令）
  // 双重保险：RN onTouchStart + 浏览器原生 click/touchstart
  const touchedOnce = useRef(false);
  const playOnce = useCallback(() => {
    if (touchedOnce.current) return;
    touchedOnce.current = true;
    startBGM();
  }, []);
  useEffect(() => {
    // Web 环境：直接挂载到 document，确保任何点击都能触发
    if (typeof document !== 'undefined') {
      document.addEventListener('click', playOnce, { once: true });
      document.addEventListener('touchstart', playOnce, { once: true });
    }
    // RN 环境：由 onTouchStart 兜底
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', playOnce);
        document.removeEventListener('touchstart', playOnce);
      }
    };
  }, [playOnce]);

  function transitionTo(next) {
    if (next === screen) return; // 已在当前屏，避免无谓重挂
    // 呼吸式淡入淡出过渡（无箭头、无滑动）
    Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => {
      setScreen(next);
      setFlightOn(false); // 离开当前流程即复位飞行上下文
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    });
  }

  return (
    <SafeAreaView style={styles.safe} onTouchStart={playOnce}>
      <StatusBar style="dark" />
      {!ready ? (
        <View style={styles.fill} />
      ) : onBoard ? (
        <OnboardScreen
          onDone={() => {
            setSettings({ seenOnboard: true });
            setOnBoard(false);
          }}
        />
      ) : (
        <>
          <Animated.View style={[styles.fill, { opacity: fade }]}>
            {screen === 'home' && (
              <HomeScreen
                onEnterPause={() => transitionTo('pause')}
                onEnterMorning={() => transitionTo('morning')}
                onEnterEvening={() => transitionTo('evening')}
                onEnterPrairie={() => transitionTo('prairie')}
                onEnterFlight={() => {
                  setFlightOn(true);
                  transitionTo('flight');
                }}
              />
            )}
            {screen === 'flight' && (
              <FlightScreen
                onStart={() => transitionTo('pause')}
                onExit={() => {
                  setFlightOn(false);
                  transitionTo('home');
                }}
              />
            )}
            {screen === 'pause' && (
              <PauseScreen
                flight={flightOn}
                onExit={() => {
                  setFlightOn(false);
                  transitionTo('home');
                }}
                onEnterPrairie={() => {
                  setFlightOn(false);
                  transitionTo('prairie');
                }}
                onEnterFour={() => {
                  setFlightOn(false);
                  transitionTo('four');
                }}
                onEnterHelp={() => {
                  setFlightOn(false);
                  transitionTo('help');
                }}
              />
            )}
            {screen === 'prairie' && (
              <PrairieScreen
                onExit={() => transitionTo('home')}
                onShowOnboard={() => setReplay(true)}
              />
            )}
            {screen === 'four' && (
              <FourStepsScreen
                onExit={() => transitionTo('home')}
                onEnterPrairie={() => transitionTo('prairie')}
              />
            )}
            {screen === 'help' && (
              <HelpFilterScreen
                onExit={() => transitionTo('home')}
                onEnterPrairie={() => transitionTo('prairie')}
              />
            )}
            {screen === 'morning' && <MorningScreen onExit={() => transitionTo('home')} />}
            {screen === 'evening' && <EveningScreen onExit={() => transitionTo('prairie')} />}
          </Animated.View>

          {/* 全局顶部「见象」= 回首页（草原 + 大象暂停法）。每屏可达 */}
          <Pressable style={styles.homeHot} onPress={() => transitionTo('home')} hitSlop={10}>
            <Text style={styles.brand}>见 象</Text>
          </Pressable>

          {/* 全局底栏：四个入口，严格出现在每一屏 */}
          <BottomNav current={screen} onNavigate={(k) => transitionTo(k)} />

          {/* 重看引导：从「我的草原」呼出，全屏覆盖，看完即隐 */}
          {replay && (
            <View style={styles.onboardOverlay}>
              <OnboardScreen onDone={() => setReplay(false)} />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  homeHot: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 8,
    zIndex: 60,
  },
  brand: {
    textAlign: 'center',
    ...font.brand,
    opacity: 0.6,
  },
  onboardOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
});
