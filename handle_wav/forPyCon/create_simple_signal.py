#coding:utf-8
import numpy as np
import pylab


def setSignal(time, wavdata):
    drawSignal(time, wavdata)


def drawSignal(time, wavdata):

    # plot merged signals
    pylab.plot(time * 1000, wavdata)
    pylab.xlabel("time [ms]")
    pylab.ylabel("amplitude")

    # draw
    pylab.show()


def setSpectrum(fs, wavdata):

    # set DFT
    n = 2048  # FFT sample rate
    dft = np.fft.fft(wavdata, n)
    # amplitude spectrum
    Adft = np.abs(dft)
    # power spectrum
    Pdft = np.abs(dft) ** 2
    # frequency scale
    fscale = np.fft.fftfreq(n, d = 1.0 / fs)

    # drawSpectrum(n, Adft, Pdft, fscale)
    drawLogSpectrum(n, Adft, Pdft, fscale)


def drawSpectrum(n, Adft, Pdft, fscale):

    # plot amplitude spectrum
    pylab.subplot(211)
    pylab.plot(fscale[0:n//2], Adft[0:n//2])
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("amplitude spectrum")
    pylab.xlim(0, 1000)

    # plot power spectrum
    pylab.subplot(212)
    pylab.plot(fscale[0:n//2], Pdft[0:n//2])
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("power spectrum")
    pylab.xlim(0, 1000)

    # draw
    pylab.show()


def drawLogSpectrum(n, Adft, Pdft, fscale):

    # plot log amplitude spectrum
    pylab.subplot(211)
    pylab.plot(fscale[0:n//2], 20 * np.log10(Adft[0:n//2]))
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log amplitude spectrum [dB]")
    pylab.xlim(0, 1000)

    # plot log power spectrum
    pylab.subplot(212)
    pylab.plot(fscale[0:n//2], 10 * np.log10(Pdft[0:n//2]))
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log power spectrum [dB]")
    pylab.xlim(0, 1000)

    # draw
    pylab.show()


if __name__ == "__main__":

    # common params
    fs = 8820.0
    time = np.arange(0.0, 0.05, 1 / fs)

    # set simple signals
    sinwav1 = 1.2 * np.sin(2 * np.pi * 130 * time)  # 振幅1.2、周波数130Hz
    coswav1 = 0.9 * np.cos(2 * np.pi * 200 * time)  # 振幅0.9、周波数200Hz
    sinwav2 = 1.8 * np.sin(2 * np.pi * 260 * time)  # 振幅1.8、周波数260Hz
    coswav2 = 1.4 * np.cos(2 * np.pi * 320 * time)  # 振幅1.4、周波数320Hz
    sinwav3 = 2.0 * np.sin(2 * np.pi * 2000 * time)  # 振幅1.8、周波数260Hz
    # coswav3 = 1.4 * np.cos(2 * np.pi * 320 * time)  # 振幅1.4、周波数320Hz

    # merge signals
    wavdata = 1.4 + (sinwav1 + coswav1 + sinwav2 + coswav2
        + sinwav1 + coswav1 + sinwav2 + coswav2
        + sinwav1 + coswav1 + sinwav2 + coswav2
        + sinwav1 + coswav1 + sinwav2 + coswav2
        + sinwav1 + coswav1 + sinwav2 + coswav2
        + sinwav3)

    # setSignal(time, wavdata)
    setSpectrum(fs, wavdata)