#!/usr/bin/python
# coding: utf-8
from scipy.io import wavfile
import pyworld
import pysptk
import numpy as np
import matplotlib.pyplot as plot


def comparisonPlot(raw, synthesized):

    # plot original wave data
    plot.subplot(2,1,1)
    plot.plot(raw)
    # plot synthesized wave data
    plot.subplot(2,1,2)
    plot.plot(synthesized)

    # draw
    plot.show()


if __name__ == "__main__":

    # load target wav file
    src_path = "wav/sample01.wav"
    fs, raw = wavfile.read(src_path)

    # common params
    frame_period = 5                                # frame period
    fftlen = pyworld.get_cheaptrick_fft_size(fs)    # frame len
    alpha = pysptk.util.mcepalpha(fs)               # frequency warping paramter (All-pass constant)
    order = 24                                      # order of mel-cepstrum

    # add white noise
    rate = 0.02
    _data = raw.astype(np.float64)
    data = _data + rate * np.random.randn(len(_data))

    # collect features
    _f0, timeaxis = pyworld.dio(data, fs, frame_period=frame_period)    # raw pitch F0
    f0 = pyworld.stonemask(data, _f0, timeaxis, fs)                     # pitch refined F0
    spectrogram = pyworld.cheaptrick(data, f0, timeaxis, fs)            # extract smoothed spectrogram
    aperiodicity = pyworld.d4c(x, f0, timeaxis, fs)                     # extract aperiodicity
    mcep = pysptk.sp2mc(spectrogram, order=order, alpha=alpha)          # calculate mel-cepstraum

    ##############################
    #                            #
    #      Convert features      #
    #             or             #
    #     Make Learning Model    #
    #                            #
    ##############################

    # convert mel-cepstrum back to power spectrum
    spectrogram = pysptk.mc2sp(mcep.astype(np.float64), alpha=alpha, fftlen=fftlen)

    # synthesize wav data
    waveform = pyworld.synthesize(f0, spectrogram, aperiodicity, fs, frame_period=frame_period)*0.00003

    # write wave data as wav file
    wavfile.write('sample.wav', fs, waveform)

    # plot for comparing raw wav to synthesized wav
    comparisonPlot(x, waveform)
