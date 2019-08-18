import wave

def join_waves(inputs, output):
    '''
    inputs : list of filenames
    output : output filename
    '''
    try:
        fps = [wave.open(f, 'r') for f in inputs]
        fpw = wave.open(output, 'w')

        fpw.setnchannels(fps[0].getnchannels())
        fpw.setsampwidth(fps[0].getsampwidth())
        fpw.setframerate(fps[0].getframerate())
        
        for fp in fps:
            fpw.writeframes(fp.readframes(fp.getnframes()))
            fp.close()
        fpw.close()

    except:
        print('unexpected error')


def to_str_num(i):
    str_i = str(i+1)

    if len(str_i) == 1:
        num = "00" + str_i
    elif len(str_i) == 2:
        num = "0" + str_i
    else:
        num = str_i

    return num


if __name__ == '__main__':
    voice_types = ['normal', 'happy', 'angry']
    actor_name = 'uemura'
    inputs = []
    output = actor_name + '_data.wav'

    for vType in voice_types:
        path = './data/' + actor_name + '_' + vType + '/_sampled/'
        wavPrefix = actor_name + '_' + vType + '_'
        inputs.extend([path + wavPrefix + to_str_num(n) + '_.wav' for n in range(0,100)])

    join_waves(inputs, output)