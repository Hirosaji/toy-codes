# #!/usr/bin/python
# # coding: utf-8
import numpy as np
import pysptk as sptk
import matplotlib.pyplot as plot
import librosa

from scipy.io import wavfile
from pysas import excite
from pysptk.synthesis import MLSADF, Synthesizer

def AddWhiteNoise(x, rate=0.02):
    #ホワイトノイズを乗せる処理
    x=x.astype(np.float64)
    return x+rate*np.random.randn(len(x))

#読み込むファイル
wavefile='wav/sample02.wav'

#wavファイル読み込み
fs, x=wavfile.read(wavefile) #fs=サンプリングレート、x=波形データ

#波形データにホワイトノイズを乗せる
data=AddWhiteNoise(x)

#ウィンドウ関数をかける
frame_length=1024
hop_length=80
frames=librosa.util.frame(data, frame_length=frame_length, hop_length=hop_length).astype(np.float64).T
frames*=sptk.blackman(frame_length)

#F0解析
f0=sptk.swipe(data.astype(np.float64), fs=fs, hopsize=hop_length, min=25, max=2000)
generator=excite.ExcitePulse(fs, hop_length, False)
source_excitation=generator.gen(f0)

order=25
alpha=0.41

#mcep解析
mc=sptk.mcep(frames, order, alpha)
synthe=Synthesizer(MLSADF(order=order, alpha=alpha), hop_length)

#解析結果から波形を生成する
b=sptk.mc2b(mc, alpha)
xsynthe=synthe.synthesis(source_excitation, b).astype(np.int16)

#生成した波形を出力
wavfile.write('xsynthe.wav', fs, xsynthe)
print('xsynthe')

#オリジナル波形
plot.subplot(3,1,1)
plot.plot(x)

#生成波形
plot.subplot(3,1,2)
plot.plot(xsynthe)

#2つを重ねたもの
plot.subplot(3,1,3)
plot.plot(x)
plot.plot(xsynthe)














































# from os.path import basename, splitext
# import sys
# import time

# import pyworld
# import pysptk

# import numpy as np
# from scipy.io import wavfile
# from nnmnkwii.preprocessing import trim_zeros_frames


# fs = 16000
# alpha = pysptk.util.mcepalpha(fs)
# order = 24
# frame_period = 5


# def collect_features(path):

#     fs, x = wavfile.read(path)

#     x = x.astype(np.float64)

#     f0, timeaxis = pyworld.dio(x, fs, frame_period=frame_period)

#     f0 = pyworld.stonemask(x, f0, timeaxis, fs)

#     spectrogram = pyworld.cheaptrick(x, f0, timeaxis, fs)
#     spectrogram = trim_zeros_frames(spectrogram)

#     mc = pysptk.sp2mc(spectrogram, order=order, alpha=alpha)

#     return mc


# if __name__ == "__main__":

#     # read wav file
#     filePath = "wav/sample02.wav"
#     mc = collect_features(filePath)

#     print(mc)



























# import numpy as np
# import pysptk
# import pylab
# import librosa
# from pysptk.synthesis import MLSADF, Synthesizer
# import wave


# sample_rate = 16000  # サンプリング周波数
# input_buffer_size = 1024 * 10  # バッファサイズ（入力）
# output_buffer_size = 1024 * 2  # バッファサイズ（入力）

# pitch_rate = 0.5  # 声の高さの調整 : 2倍にすれば1オクターブ下に、0.5倍にすれば1オクターブ上に
# sp_rate = 0.75  # 声色の調整 (> 0.0) : 女性の声にする場合は1.0より小さく、男性はその逆で大きく

# # 音声の分析条件
# frame_length = 512
# frame_shift = 80

# # メルケプストラムの抽出条件
# order = 25
# alpha = 0.41
# mcep_floor = 0.0001


# def analysis_resynthesis(signal, fs):

#     # フレーム化処理
#     frames = librosa.util.frame(
#         signal, frame_length=frame_length,
#         hop_length=frame_shift).astype(np.float64).transpose()

#     # 窓掛け
#     frames *= pysptk.blackman(frame_length)

#     # ピッチの抽出
#     pitch = pysptk.swipe(signal, fs=sample_rate,
#                          hopsize=frame_shift, min=60, max=240,
#                          otype="pitch")

#     # ピッチシフト
#     pitch *= pitch_rate

#     # 振幅スペクトルを計算
#     fft_frames = np.abs(np.fft.fft(frames))

#     # 振幅スペクトルの対称性より半分だけ取り出す
#     fft_frames = fft_frames[:, 0:int(frame_length / 2) + 1]

#     # フォルマントシフト
#     m_frames = np.zeros_like(fft_frames)
#     sp_range = int(m_frames.shape[1] * sp_rate)
#     for i in range(m_frames.shape[1]):
#         if (i < sp_range):
#             if sp_rate >= 1.0:
#                 m_frames[:, i] = fft_frames[:, int(i / sp_rate)]
#             else:
#                 m_frames[:, i] = fft_frames[:, int(i * sp_rate)]
#         else:
#             m_frames[:, i] = fft_frames[:, i]

#     # フロア処理
#     m_frames += mcep_floor

#     # メルケプストラムの抽出
#     mc = pysptk.mcep(m_frames * 1000, order=order, alpha=alpha, itype=3)

#     # # ディジタルフィルタ係数に変換
#     # b = pysptk.mc2b(mc, alpha)

#     # # 励振信号の作成
#     # source_excitation = pysptk.excite(pitch, frame_shift)

#     # # 音声の再合成
#     # synthesizer = Synthesizer(MLSADF(order=order, alpha=alpha), frame_shift)
#     # synthesized = synthesizer.synthesis(source_excitation, b)
#     # print(len(synthesized))
#     # synthesized = synthesized[0:-int(2 * frame_length)] # ぶつ切れ感の回避
#     # print(len(synthesized))

#     # return synthesized



#     # plot
#     pylab.plot(m_frames[0][0:len(mc[0])], mc[0])
#     pylab.xlabel("Frequency [Hz]")
#     pylab.ylabel("log amplitude cepstrum")
#     # draw
#     pylab.show()


# def wavread(filename):

#     wf = wave.open(filename, "r")

#     fs = wf.getframerate()
#     x = wf.readframes(wf.getnframes())
#     x = np.frombuffer(x, dtype="int16") / 32768.0  # normalize -> (-1, 1)

#     wf.close()

#     return x, float(fs)


# if __name__ == "__main__":

#     # read wav file
#     filePath = "wav/sample02.wav"
#     wav, fs = wavread(filePath)

#     # convert to ndarray
#     t = np.arange(0.0, len(wav) / fs, 1/fs)

#     output = analysis_resynthesis(t, fs)

#     # # 書き出し
#     # w = wave.Wave_write("output.wav")
#     # w.setnchannels(1)
#     # w.setsampwidth(2)
#     # w.setframerate(44100)
#     # w.writeframes(output)
#     # w.close()