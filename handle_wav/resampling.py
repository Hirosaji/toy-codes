import wave
import struct
import numpy as np
import scipy
from scipy import signal


def readWav(filename):
    """
    wavファイルを読み込んで，データ・サンプリングレートを返す関数
    """
    wf = wave.open(filename)
    fs = wf.getframerate()
    # -1 ~ 1までに正規化した信号データを読み込む
    data = np.frombuffer(wf.readframes(wf.getnframes()),dtype="int16")/32768.0
    return (data,fs)


def upsampling(conversion_rate,data,fs):
    """
    アップサンプリングを行う．
    入力として，変換レートとデータとサンプリング周波数．
    アップサンプリング後のデータとサンプリング周波数を返す．
    """
    # 補間するサンプル数を決める
    interpolationSampleNum = conversion_rate-1

    # FIRフィルタの用意をする
    nyqF = fs/2.0     # 変換後のナイキスト周波数
    cF = (fs/2.0-500.)/nyqF             # カットオフ周波数を設定（変換前のナイキスト周波数より少し下を設定）
    taps = 511                          # フィルタ係数（奇数じゃないとだめ）
    b = signal.firwin(taps, cF)   # LPFを用意

    # 補間処理
    upData = []
    for d in data:
        upData.append(d)
        # 1サンプルの後に，interpolationSampleNum分だけ0を追加する
        for i in range(interpolationSampleNum):
            upData.append(0.0)

    # フィルタリング
    resultData = signal.lfilter(b,1,upData)
    return (resultData,fs*conversion_rate)


def downsampling(conversion_rate,data,fs):
    """
    ダウンサンプリングを行う．
    入力として，変換レートとデータとサンプリング周波数．
    ダウンサンプリング後のデータとサンプリング周波数を返す．
    """
    # 間引くサンプル数を決める
    decimationSampleNum = conversion_rate-1

    # FIRフィルタの用意をする
    nyqF = fs/2.0             # 変換後のナイキスト周波数
    cF = (fs/conversion_rate/2.0-500.)/nyqF     # カットオフ周波数を設定（変換前のナイキスト周波数より少し下を設定）
    taps = 511                                  # フィルタ係数（奇数じゃないとだめ）
    b = signal.firwin(taps, cF)           # LPFを用意

    #フィルタリング
    data = signal.lfilter(b,1,data)

    #間引き処理
    downData = []
    for i in range(0,len(data),decimationSampleNum+1):
        downData.append(data[i])

    return (downData,fs/conversion_rate)


def writeWav(filename,data,fs):
    """
    入力されたファイル名でwavファイルを書き出す．
    """
    # データを-32768から32767の整数値に変換
    data = [int(x * 32767.0) for x in data]
    #バイナリ化
    binwave = struct.pack("h" * len(data), *data)
    wf = wave.Wave_write(filename)
    wf.setparams((
        1,                          # channel
        2,                          # byte width
        fs,                         # sampling rate
        len(data),                  # number of frames
        "NONE", "not compressed"    # no compression
        ))
    wf.writeframes(binwave)
    wf.close()


if __name__ == "__main__":
    # 何倍にするかを決めておく
    up_conversion_rate = 2
    # 何分の1にするか決めておく．ここではその逆数を指定しておく（例：1/2なら2と指定）
    down_conversion_rate = 2

    raw_path = "./dat/raw/uemura_normal_"
    down_path = "./dat/down/uemura_normal_"

    for i in range(100):

        str_i = str(i+1)

        if len(str_i) == 1:
            num = "00" + str_i
        elif len(str_i) == 2:
            num = "0" + str_i
        else:
            num = str_i

        data,fs = readWav(path + num + ".wav")

        # upData,upFs = upsampling(up_conversion_rate,data,fs)
        downData,downFs = downsampling(down_conversion_rate,data,fs)

        # writeWav("up.wav",upData,upFs)
        writeWav(down_path + num + ".wav",downData,downFs)