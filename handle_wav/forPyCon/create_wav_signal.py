#coding:utf-8
import numpy as np
import pylab
import wave


def setWavSignal(t, wav):
    drawWavSignal(t, wav)


def drawWavSignal(t, wav):

    # plot
    pylab.plot(t * 1000, wav)
    pylab.xlabel("time [ms]")
    pylab.ylabel("amplitude")
    # draw
    pylab.show()


def setWindow(t, wav, fs):

    # sampling wav
    center = len(wav) / 2  # sampling number (center)
    cuttime = 0.05         # target length [s]
    wavdata = wav[int(center - cuttime/2*fs) : int(center + cuttime/2*fs)]
    time = t[int(center - cuttime/2*fs) : int(center + cuttime/2*fs)]

    # multiplicate window func
    hanningWindow = np.hanning(len(wavdata))
    hanningWavdata = wavdata * hanningWindow

    # drawWindow(time, wavdata, hanningWavdata)
    setSpectrum(time, fs, hanningWavdata)


def drawWindow(time, wavdata, hanningWavdata):

    # plot
    pylab.subplot(211)
    pylab.plot(time * 1000, wavdata)
    pylab.ylabel("amplitude")
    # plot
    pylab.subplot(212)
    pylab.plot(time * 1000, hanningWavdata)
    pylab.xlabel("time [ms]")
    pylab.ylabel("amplitude")
    # draw
    pylab.show()


def setSpectrum(time, fs, wavdata):

    n = 1600  # FFT sample rate
    dft = np.fft.fft(wavdata, n)
    # amplitude spectrum
    Adft = np.abs(dft)
    AdftLog = 20 * np.log10(Adft)
    # power spectrum
    Pdft = np.abs(dft) ** 2
    PdftLog = 10 * np.log10(Pdft)
    # frequency scale
    fscale = np.fft.fftfreq(n, d = 1.0 / fs)

    # drawSpectrum(n, Adft, Pdft, fscale)
    drawLogSpectrum(n, AdftLog, PdftLog, fscale)
    drawCepstrum(n, time, AdftLog)
    drawSpectralEnvelope(n, fscale, AdftLog)
    drawFineStructure(n, fscale, AdftLog)


def drawSpectrum(n, AdftLog, PdftLog, fscale):

    # plot amplitude spectrum
    pylab.subplot(211)
    pylab.plot(fscale[0:int(n/2)], Adft[0:int(n/2)])
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log amplitude spectrum")
    pylab.xlim(0, 5000)

    # plot power spectrum
    pylab.subplot(212)
    pylab.plot(fscale[0:int(n/2)], Pdft[0:int(n/2)])
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log power spectrum")
    pylab.xlim(0, 5000)

    # draw
    pylab.show()


def drawLogSpectrum(n, AdftLog, PdftLog, fscale):

    # plot log amplitude spectrum
    pylab.subplot(211)
    pylab.plot(fscale[0:int(n/2)], AdftLog[0:int(n/2)])
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log amplitude spectrum [dB]")
    pylab.xlim(0, 5000)

    # plot log power spectrum
    pylab.subplot(212)
    pylab.plot(fscale[0:int(n/2)], PdftLog[0:int(n/2)])
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log power spectrum [dB]")
    pylab.xlim(0, 8000)
    # draw
    pylab.show()


def drawCepstrum(n, time, AdftLog):

    cps = np.real(np.fft.ifft(AdftLog))
    quefrency = time - min(time)

    # plot
    pylab.plot(quefrency[0:int(n/2)] * 1000, cps[0:int(n/2)])
    pylab.xlabel("quefrency")
    pylab.ylabel("log amplitude cepstrum")
    # draw
    pylab.show()


def drawSpectralEnvelope(n, fscale, AdftLog):
    # low-pass filter for sampling spectral envelope
    cepCoef = 50    # cepstrum degree (dimension numbe)
    cps = np.real(np.fft.ifft(AdftLog))
    cpsLif = np.array(cps)
    cpsLif[cepCoef:len(cpsLif) - cepCoef + 1] = 0

    # inverse Fourier transform
    dftSpc = np.fft.fft(cpsLif, n)

    # plot
    # original log amplitude spectrum
    pylab.plot(fscale[0:int(n/2)], AdftLog[0:int(n/2)], color="gray")
    # spectral envelope
    pylab.plot(fscale[0:int(n/2)], dftSpc[0:int(n/2)], color="red")
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log amplitude spectrum")
    pylab.xlim(0, 5000)
    # draw
    pylab.show()


def drawFineStructure(n, fscale, AdftLog):
    # high-pass filter for sampling fine structure spectrum
    cepCoef = 50    # cepstrum degree (dimension numbe)
    cps = np.real(np.fft.ifft(AdftLog))
    cpsLif = np.array(cps)
    cpsLif[0:cepCoef] = 0

    # inverse Fourier transform
    dftSpc = np.fft.fft(cpsLif, n)

    # plot
    # original log amplitude spectrum
    pylab.plot(fscale[0:int(n/2)], AdftLog[0:int(n/2)], color="gray")
    # fine structure spectrum
    pylab.plot(fscale[0:int(n/2)], dftSpc[0:int(n/2)], color="red")
    pylab.xlabel("frequency [Hz]")
    pylab.ylabel("log amplitude spectrum")
    pylab.xlim(0, 5000)
    # draw
    pylab.show()


def wavread(filename):

    wf = wave.open(filename, "r")

    fs = wf.getframerate()
    x = wf.readframes(wf.getnframes())
    x = np.frombuffer(x, dtype="int16") / 32768.0  # normalize -> (-1, 1)

    wf.close()

    return x, float(fs)


if __name__ == "__main__":

    # read wav file
    filePath = "wav/sample02.wav"
    wav, fs = wavread(filePath)

    # convert to ndarray
    t = np.arange(0.0, len(wav) / fs, 1/fs)

    setWavSignal(t, wav)
    setWindow(t, wav, fs)
