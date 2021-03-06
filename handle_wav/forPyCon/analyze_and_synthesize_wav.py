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
    src_path = "sample01.wav"
    fs, raw_wave = wavfile.read(src_path)
    data = raw_wave.astype(np.float64)

    # common params
    frame_period = 5                                # frame period
    fftlen = pyworld.get_cheaptrick_fft_size(fs)    # frame len
    alpha = pysptk.util.mcepalpha(fs)               # frequency warping paramter (All-pass constant)
    order = 24                                      # order of mel-cepstrum

    # collect features
    _f0, timeaxis = pyworld.dio(data, fs, frame_period=frame_period)  # extract raw pitch F0
    f0 = pyworld.stonemask(data, _f0, timeaxis, fs)                   # extract pitch refined F0
    spectrum = pyworld.cheaptrick(data, f0, timeaxis, fs)             # extract smoothed spectrum
    aperiodicity = pyworld.d4c(data, f0, timeaxis, fs)                # extract aperiodicity
    mcep = pysptk.sp2mc(spectrum, order=order, alpha=alpha)           # calculate mel-cepstraum

    ###############################
    #                             #
    #      Convert features       #
    #             or              #
    #     Make Learning Model     #
    #                             #
    ###############################

    # convert mel-cepstrum back to spectrum
    spectrum = pysptk.mc2sp(mcep.astype(np.float64), alpha=alpha, fftlen=fftlen)

    # synthesize wav data
    _wave = pyworld.synthesize(f0, spectrum, aperiodicity, fs, frame_period=frame_period)

    # adjust sound volume
    volume_weight = len(data) / frame_period
    wave = _wave / volume_weight

    # write wave data as wav file
    wavfile.write('sample.wav', fs, wave)

    # plot for comparing raw wav to synthesized wav
    comparisonPlot(raw_wave, wave)
