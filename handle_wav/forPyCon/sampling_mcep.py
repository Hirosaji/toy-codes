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
