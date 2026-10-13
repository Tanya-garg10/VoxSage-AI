import os
import wave
import struct
import math

def generate_wav(filepath, duration_sec, f0_base=150.0, f0_variation=25.0, pause_start=None, pause_dur=None, speed=1.0, fade_start=None, fade_dur=None):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    sr = 16000
    n_samples = int(duration_sec * sr / speed)
    wf = wave.open(filepath, 'w')
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)

    for i in range(n_samples):
        t = (i / sr) * speed
        # Check if in inserted pause interval
        if pause_start is not None and pause_dur is not None:
            if pause_start <= t < (pause_start + pause_dur):
                wf.writeframes(struct.pack('<h', 0))
                continue

        # Check energy fade
        amp_scale = 1.0
        if fade_start is not None and fade_dur is not None:
            if t >= fade_start:
                fade_progress = min(1.0, (t - fade_start) / fade_dur)
                amp_scale = max(0.15, 1.0 - (0.85 * fade_progress))

        # Syllable rhythm (~4 syllables/sec)
        syllable = 0.5 + 0.5 * math.sin(2.0 * math.pi * 4.0 * t)**2
        # Smooth boundaries
        boundary = min(1.0, t / 0.1) * min(1.0, (duration_sec - t) / 0.1)

        # F0 contour
        f0 = f0_base + f0_variation * math.sin(2.0 * math.pi * 0.7 * t)
        phase = 2.0 * math.pi * f0 * t

        # Vocal harmonics
        val = (
            0.55 * math.sin(phase) +
            0.28 * math.sin(2.0 * phase) +
            0.15 * math.sin(3.0 * phase) +
            0.08 * math.sin(4.0 * phase)
        )

        sample = val * syllable * boundary * amp_scale * 0.8
        sample = max(-1.0, min(1.0, sample))
        int_sample = int(sample * 32767.0)
        wf.writeframes(struct.pack('<h', int_sample))

    wf.close()
    print(f"Generated {filepath} ({duration_sec}s)")

def main():
    dirs = ["dataset/examples", "public/samples"]
    for d in dirs:
        # 1. Keynote pair (excessive pause flaw)
        generate_wav(f"{d}/sample_reference_keynote.wav", duration_sec=5.2, f0_base=155.0, f0_variation=28.0)
        generate_wav(f"{d}/sample_flawed_keynote.wav", duration_sec=6.5, f0_base=155.0, f0_variation=28.0, pause_start=2.1, pause_dur=1.3)

        # 2. Pitch pair (rushed delivery flaw)
        generate_wav(f"{d}/sample_reference_pitch.wav", duration_sec=6.0, f0_base=160.0, f0_variation=22.0)
        generate_wav(f"{d}/sample_flawed_pitch_fast.wav", duration_sec=6.0, f0_base=160.0, f0_variation=22.0, speed=1.45)

        # 3. Commencement pair (monotone pitch flaw)
        generate_wav(f"{d}/sample_reference_commence.wav", duration_sec=5.5, f0_base=145.0, f0_variation=35.0)
        generate_wav(f"{d}/sample_flawed_monotone.wav", duration_sec=5.5, f0_base=145.0, f0_variation=3.0)  # extremely flat F0

        # 4. Podcast pair (vocal fade flaw)
        generate_wav(f"{d}/sample_reference_podcast.wav", duration_sec=5.8, f0_base=150.0, f0_variation=20.0)
        generate_wav(f"{d}/sample_flawed_fade.wav", duration_sec=5.8, f0_base=150.0, f0_variation=20.0, fade_start=3.2, fade_dur=2.0)

        # 5. Debate pair
        generate_wav(f"{d}/sample_reference_debate.wav", duration_sec=5.0, f0_base=165.0, f0_variation=25.0)
        generate_wav(f"{d}/sample_flawed_debate.wav", duration_sec=6.2, f0_base=165.0, f0_variation=25.0, pause_start=3.0, pause_dur=1.2)

        # 6. Training pair
        generate_wav(f"{d}/sample_reference_training.wav", duration_sec=5.0, f0_base=150.0, f0_variation=20.0)
        generate_wav(f"{d}/sample_flawed_spectral.wav", duration_sec=5.0, f0_base=150.0, f0_variation=18.0)

if __name__ == "__main__":
    main()
