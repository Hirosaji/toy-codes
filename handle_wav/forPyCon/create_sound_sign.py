#coding:utf-8
import numpy as np
import pylab

if __name__ == "__main__":

    # common params
    fs = 8820.0
    time = np.arange(0.0, 0.05, 1 / fs)

    # set simple signals
    sinwav1 = 1.2 * np.sin(2 * np.pi * 130 * time)  # 振幅1.2、周波数130Hz
    coswav1 = 0.9 * np.cos(2 * np.pi * 200 * time)  # 振幅0.9、周波数200Hz
    sinwav2 = 1.8 * np.sin(2 * np.pi * 260 * time)  # 振幅1.8、周波数260Hz
    coswav2 = 1.4 * np.cos(2 * np.pi * 320 * time)  # 振幅1.4、周波数320Hz

    # merge signals
    wavdata = 1.4 + (sinwav1 + coswav1 + sinwav2 + coswav2)

    # plot merged signals
    pylab.plot(time * 1000, wavdata)
    pylab.xlabel("時間 [ms]")
    pylab.ylabel("振幅")
    pylab.show()