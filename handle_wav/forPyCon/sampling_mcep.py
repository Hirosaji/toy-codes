#!/usr/bin/python
# coding: utf-8
import numpy as np
import pysptk as sptk
import matplotlib.pyplot as plot
import librosa

from scipy.io import wavfile
from pysas import excite
from pysptk.synthesis import MLSADF, Synthesizer


def AddWhiteNoise(x, rate=0.02):
    x = x.astype(np.float64)
    return x + rate * np.random.randn(len(x))


def plot(x, xsynthe):

    # plot original wav data
    plot.subplot(3,1,1)
    plot.plot(x)

    # plot synthesized audio data
    plot.subplot(3,1,2)
    plot.plot(xsynthe)

    # plot origin & synthesized
    plot.subplot(3,1,3)
    plot.plot(x)
    plot.plot(xsynthe)

    # draw
    plot.show()


if __name__ == "__main__":

    # read wav file
    wavefile = "wav/sample02.wav"
    fs, x = wavfile.read(wavefile) # fs: sampling rate, x: wave data

    # add white noise on target wav data
    data = AddWhiteNoise(x)

    # multiplicate window func
    frame_length = 1024
    hop_length = 80
    frames = librosa.util.frame(data, frame_length=frame_length, hop_length=hop_length).astype(np.float64).T
    frames *= sptk.blackman(frame_length)

    # estimate F0
    f0 = sptk.swipe(data.astype(np.float64), fs=fs, hopsize=hop_length, min=25, max=2000)
    generator = excite.ExcitePulse(fs, hop_length, False)
    source_excitation = generator.gen(f0)

    # params
    order = 25
    alpha = 0.41

    # estimate mel cepstrum (MCEP)
    mc = sptk.mcep(frames, order, alpha)
    synthe = Synthesizer(MLSADF(order=order, alpha=alpha), hop_length)

    # synthesize audio data from acoustic features
    b = sptk.mc2b(mc, alpha)
    xsynthe = synthe.synthesis(source_excitation, b).astype(np.int16)
    # wav = pyworld.synthesize(f0*2.0, mc, ap, fs)

    # write audio data as wav file
    wavfile.write('sample.wav', fs, xsynthe)

