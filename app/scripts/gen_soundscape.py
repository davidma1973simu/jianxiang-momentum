"""
见象 Momentum · 声景资产生成器
铁律：点睛的单声，温暖、极轻、一声即止、绝不喧闹。
生成两个短音：
  stop-bowl.wav   —— 停/息屏：低频温暖钵响（听觉版"大象来了"）
  touch-ripple.wav —— 触动了我：极轻涟漪回应（非奖励"叮"）
"""
import numpy as np
import wave
import struct
import os

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sound")
os.makedirs(OUT, exist_ok=True)


def write_wav(path, samples):
    # samples: float32 in [-1, 1] -> 16-bit PCM mono
    samples = np.clip(samples, -1.0, 1.0)
    ints = (samples * 32767.0).astype(np.int16)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(ints.tobytes())
    print("wrote", path, f"{len(samples)/SR:.2f}s")


def fade(sig, attack=0.06, release=0.4):
    n = len(sig)
    env = np.ones(n)
    a = int(SR * attack)
    r = int(SR * release)
    if a > 0:
        env[:a] = np.linspace(0, 1, a) ** 1.5   # 柔和渐入
    if r > 0:
        env[-r:] = np.linspace(1, 0, r) ** 1.8  # 自然衰减
    return sig * env


def stop_bowl():
    """低频温暖钵响：基频 + 微失谐泛音（仿真实颂钵），慢起长衰，轻微 shimmer。"""
    dur = 1.7
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    f0 = 196.0  # G3，温暖不刺耳
    # 真实颂钵是"非谐"泛音
    partials = [(1.0, 1.00), (2.74, 0.34), (5.42, 0.14), (8.20, 0.06)]
    sig = np.zeros_like(t)
    for ratio, amp in partials:
        # 每个泛音自己的衰减：越高衰减越快
        decay = np.exp(-t * (1.6 + ratio * 0.55))
        sig += amp * np.sin(2 * np.pi * f0 * ratio * t) * decay
    # 轻微 shimmer（1.3Hz 振幅起伏），像钵体的呼吸
    shimmer = 1.0 + 0.05 * np.sin(2 * np.pi * 1.3 * t)
    sig = sig * shimmer
    sig = fade(sig, attack=0.05, release=0.55)
    sig = sig / np.max(np.abs(sig)) * 0.5   # 峰值压到 0.5，保持温和
    return sig


def touch_ripple():
    """极轻涟漪：一滴柔和的水/叶回应，快起快落，绝非'叮'的奖励音。"""
    dur = 0.55
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    # 主音 + 一个低五度，都很快衰减，营造"轻轻应了一下"
    f = 587.33  # D5，柔和
    sig = np.sin(2 * np.pi * f * t) * np.exp(-t * 9.0)
    sig += 0.4 * np.sin(2 * np.pi * (f * 0.5) * t) * np.exp(-t * 7.0)
    # 极小的向上滑音尾巴，像涟漪扩散
    gliss = np.sin(2 * np.pi * (f * 1.5) * t) * np.exp(-t * 16.0) * 0.15
    sig = sig + gliss
    sig = fade(sig, attack=0.004, release=0.12)
    sig = sig / np.max(np.abs(sig)) * 0.34   # 比钵响更轻
    return sig


if __name__ == "__main__":
    write_wav(os.path.join(OUT, "stop-bowl.wav"), stop_bowl())
    write_wav(os.path.join(OUT, "touch-ripple.wav"), touch_ripple())
    print("声景资产生成完成 →", os.path.abspath(OUT))
