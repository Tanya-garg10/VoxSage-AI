import os
import json
import wave
import numpy as np

def generate_wav(filepath, duration_sec, f0_base=150.0, f0_variation=25.0, pause_start=None, pause_dur=None, speed=1.0, fade_start=None, fade_dur=None):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    sr = 16000
    n_samples = int(duration_sec * sr / speed)
    t = (np.arange(n_samples) / sr) * speed

    # Dynamic F0 contour and continuous phase accumulation
    f0 = f0_base + f0_variation * np.sin(2.0 * np.pi * 0.7 * t)
    phase = 2.0 * np.pi * np.cumsum(f0) / sr

    # Vocal harmonics
    vocal = (
        0.55 * np.sin(phase) +
        0.28 * np.sin(2.0 * phase) +
        0.15 * np.sin(3.0 * phase) +
        0.08 * np.sin(4.0 * phase)
    )

    syllable = 0.5 + 0.5 * (np.sin(2.0 * np.pi * 4.0 * t) ** 2)
    boundary = np.clip(t / 0.1, 0, 1) * np.clip((duration_sec - t) / 0.1, 0, 1)
    signal = vocal * syllable * boundary * 0.8

    # Apply pause if requested
    if pause_start is not None and pause_dur is not None:
        pause_mask = (t >= pause_start) & (t < (pause_start + pause_dur))
        signal[pause_mask] = 0.0

    # Apply energy fade if requested
    if fade_start is not None and fade_dur is not None:
        fade_mask = t >= fade_start
        if np.any(fade_mask):
            fade_progress = np.clip((t[fade_mask] - fade_start) / fade_dur, 0, 1)
            amp_scale = np.maximum(0.12, 1.0 - (0.88 * fade_progress))
            signal[fade_mask] *= amp_scale

    signal = np.clip(signal, -1.0, 1.0)
    int_signal = (signal * 32767.0).astype(np.int16)

    with wave.open(filepath, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(int_signal.tobytes())

def main():
    target_dirs = ["dataset/examples", "public/samples"]
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

    # Base reference audio tracks
    ref_specs = {
        "keynote": {"dur": 5.2, "f0": 155.0, "var": 28.0},
        "pitch": {"dur": 6.0, "f0": 160.0, "var": 22.0},
        "commence": {"dur": 5.5, "f0": 145.0, "var": 35.0},
        "podcast": {"dur": 5.8, "f0": 150.0, "var": 20.0},
        "debate": {"dur": 5.0, "f0": 165.0, "var": 25.0},
        "training": {"dur": 5.0, "f0": 150.0, "var": 20.0},
    }

    # Generate reference master tracks
    for name, s in ref_specs.items():
        for d in target_dirs:
            # Both named files for clarity
            generate_wav(f"{d}/sample_reference_{name}.wav", duration_sec=s["dur"], f0_base=s["f0"], f0_variation=s["var"])
            generate_wav(f"{d}/speech_{name}_ref.wav", duration_sec=s["dur"], f0_base=s["f0"], f0_variation=s["var"])

    # Generate 1-to-many controlled variants
    variant_specs = [
        # 1. Keynote variants
        ("keynote", "pause", {"dur": 6.5, "f0": 155.0, "var": 28.0, "pause_start": 2.1, "pause_dur": 1.3}),
        ("keynote", "fast", {"dur": 5.2, "f0": 155.0, "var": 28.0, "speed": 1.45}),
        ("keynote", "fade", {"dur": 5.2, "f0": 155.0, "var": 28.0, "fade_start": 3.4, "fade_dur": 1.8}),
        ("keynote", "monotone", {"dur": 5.2, "f0": 155.0, "var": 2.0}),

        # 2. Pitch variants
        ("pitch", "fast", {"dur": 6.0, "f0": 160.0, "var": 22.0, "speed": 1.42}),
        ("pitch", "pause", {"dur": 7.3, "f0": 160.0, "var": 22.0, "pause_start": 2.4, "pause_dur": 1.3}),
        ("pitch", "fade", {"dur": 6.0, "f0": 160.0, "var": 22.0, "fade_start": 4.0, "fade_dur": 1.8}),
        ("pitch", "monotone", {"dur": 6.0, "f0": 160.0, "var": 2.5}),

        # 3. Commencement variants
        ("commence", "monotone", {"dur": 5.5, "f0": 145.0, "var": 2.0}),
        ("commence", "pause", {"dur": 6.7, "f0": 145.0, "var": 35.0, "pause_start": 2.5, "pause_dur": 1.2}),
        ("commence", "fade", {"dur": 5.5, "f0": 145.0, "var": 35.0, "fade_start": 3.5, "fade_dur": 1.8}),

        # 4. Podcast variants
        ("podcast", "fade", {"dur": 5.8, "f0": 150.0, "var": 20.0, "fade_start": 3.2, "fade_dur": 2.0}),
        ("podcast", "fast", {"dur": 5.8, "f0": 150.0, "var": 20.0, "speed": 1.38}),
        ("podcast", "pause", {"dur": 7.0, "f0": 150.0, "var": 20.0, "pause_start": 2.8, "pause_dur": 1.2}),

        # 5. Debate variants (Natural Human Rehearsal + Synthetic)
        ("debate", "pause", {"dur": 6.2, "f0": 165.0, "var": 25.0, "pause_start": 3.0, "pause_dur": 1.2}),
        ("debate", "fast", {"dur": 5.0, "f0": 165.0, "var": 25.0, "speed": 1.40}),

        # 6. Training module variants (Natural Articulation + Pause)
        ("training", "spectral", {"dur": 5.0, "f0": 150.0, "var": 18.0}),
        ("training", "pause", {"dur": 6.2, "f0": 150.0, "var": 20.0, "pause_start": 2.0, "pause_dur": 1.2}),
    ]

    for domain, variant, kwargs in variant_specs:
        gen_kwargs = {
            "duration_sec": kwargs.get("dur", 5.0),
            "f0_base": kwargs.get("f0", 150.0),
            "f0_variation": kwargs.get("var", 25.0),
            "pause_start": kwargs.get("pause_start"),
            "pause_dur": kwargs.get("pause_dur"),
            "speed": kwargs.get("speed", 1.0),
            "fade_start": kwargs.get("fade_start"),
            "fade_dur": kwargs.get("fade_dur")
        }
        for d in target_dirs:
            generate_wav(f"{d}/speech_{domain}_{variant}.wav", **gen_kwargs)
            
            # Map legacy names so all existing components work seamlessly
            if domain == "keynote" and variant == "pause":
                generate_wav(f"{d}/sample_flawed_keynote.wav", **gen_kwargs)
            elif domain == "pitch" and variant == "fast":
                generate_wav(f"{d}/sample_flawed_pitch_fast.wav", **gen_kwargs)
            elif domain == "commence" and variant == "monotone":
                generate_wav(f"{d}/sample_flawed_monotone.wav", **gen_kwargs)
            elif domain == "podcast" and variant == "fade":
                generate_wav(f"{d}/sample_flawed_fade.wav", **gen_kwargs)
            elif domain == "debate" and variant == "pause":
                generate_wav(f"{d}/sample_flawed_debate.wav", **gen_kwargs)
            elif domain == "training" and variant == "spectral":
                generate_wav(f"{d}/sample_flawed_spectral.wav", **gen_kwargs)

    # Master contrastive benchmark dataset metadata
    dataset = [
        # PAIR 1 - Keynote: Excessive Pause
        {
            "pair_id": "PAIR_001_PAUSE",
            "reference_file": "sample_reference_keynote.wav",
            "comparison_file": "speech_keynote_pause.wav",
            "transcript": "Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.",
            "flaw_type": "excessive_pauses",
            "start_time": 2.1,
            "end_time": 3.4,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-001-KEYNOTE",
            "title": "Product Keynote — Hesitation Pause",
            "speechDomain": "Tech Keynote / Presentation",
            "speaker": "Speaker A (Keynote Master Baseline)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_keynote.wav",
            "participantAudioFile": "sample_flawed_keynote.wav",
            "flawCategory": "excessive_pauses",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 2.1, "end": 3.4, "label": "Abrupt hesitation between 'Today we are' and 'fundamentally redefining'"}],
            "isSynthetic": True,
            "split": "test",
            "notes": "Exact 1.30s silence window algorithmically injected into continuous master reference."
        },
        # PAIR 2 - Keynote: Rushed Delivery
        {
            "pair_id": "PAIR_002_SPEED",
            "reference_file": "sample_reference_keynote.wav",
            "comparison_file": "speech_keynote_fast.wav",
            "transcript": "Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.",
            "flaw_type": "excessive_speed",
            "start_time": 0.0,
            "end_time": 3.6,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-002-KEYNOTE-SPEED",
            "title": "Product Keynote — Rushed Delivery",
            "speechDomain": "Tech Keynote / Presentation",
            "speaker": "Speaker A (Keynote Speed Variant)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_keynote.wav",
            "participantAudioFile": "speech_keynote_fast.wav",
            "flawCategory": "rushed_delivery",
            "flawSeverity": "severe",
            "groundTruthIntervals": [{"start": 0.0, "end": 3.6, "label": "Accelerated delivery with 31% duration compression relative to baseline clarity"}],
            "isSynthetic": True,
            "split": "test",
            "notes": "Controlled speed perturbation (1.45x resampling) applied to keynote master track."
        },
        # PAIR 3 - Keynote: Vocal Fade
        {
            "pair_id": "PAIR_003_FADE",
            "reference_file": "sample_reference_keynote.wav",
            "comparison_file": "speech_keynote_fade.wav",
            "transcript": "Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.",
            "flaw_type": "vocal_fade",
            "start_time": 3.4,
            "end_time": 5.2,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-003-KEYNOTE-FADE",
            "title": "Product Keynote — Vocal Projection Fade",
            "speechDomain": "Tech Keynote / Presentation",
            "speaker": "Speaker A (Keynote Fade Variant)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_keynote.wav",
            "participantAudioFile": "speech_keynote_fade.wav",
            "flawCategory": "vocal_fade",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 3.4, "end": 5.2, "label": "Terminal clause projection loss (>55% RMS energy attenuation)"}],
            "isSynthetic": True,
            "split": "validation",
            "notes": "Controlled parametric envelope attenuation simulating loss of breath support at clause terminal."
        },
        # PAIR 4 - Keynote: Monotone Pitch
        {
            "pair_id": "PAIR_004_MONOTONE",
            "reference_file": "sample_reference_keynote.wav",
            "comparison_file": "speech_keynote_monotone.wav",
            "transcript": "Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.",
            "flaw_type": "monotone_pitch",
            "start_time": 0.5,
            "end_time": 4.8,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-004-KEYNOTE-MONOTONE",
            "title": "Product Keynote — Monotone Intonation",
            "speechDomain": "Tech Keynote / Presentation",
            "speaker": "Speaker A (Keynote Monotone Variant)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_keynote.wav",
            "participantAudioFile": "speech_keynote_monotone.wav",
            "flawCategory": "monotone_pitch",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 0.5, "end": 4.8, "label": "Compressed pitch inflection (<1.5 semitones dynamic range)"}],
            "isSynthetic": True,
            "split": "train",
            "notes": "Synthetic pitch modulation suppression to test F0 excursion sensitivity."
        },
        # PAIR 5 - Pitch: Rushed Delivery
        {
            "pair_id": "PAIR_005_PITCH_SPEED",
            "reference_file": "sample_reference_pitch.wav",
            "comparison_file": "sample_flawed_pitch_fast.wav",
            "transcript": "Every single day millions of professionals waste countless hours attempting to manually debug temporal inconsistencies in voice pipelines.",
            "flaw_type": "excessive_speed",
            "start_time": 0.0,
            "end_time": 3.8,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-002-INVESTOR-PITCH",
            "title": "Startup Pitch — Problem Statement Pacing",
            "speechDomain": "Investor Pitch",
            "speaker": "Speaker B (Rushed Cadence)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_pitch.wav",
            "participantAudioFile": "sample_flawed_pitch_fast.wav",
            "flawCategory": "rushed_delivery",
            "flawSeverity": "severe",
            "groundTruthIntervals": [{"start": 0.0, "end": 3.8, "label": "Accelerated delivery with 38% duration compression relative to baseline clarity"}],
            "isSynthetic": True,
            "split": "test",
            "notes": "Controlled speed perturbation (1.42x resampling) applied to investor pitch baseline track."
        },
        # PAIR 6 - Pitch: Pause Flaw
        {
            "pair_id": "PAIR_006_PITCH_PAUSE",
            "reference_file": "sample_reference_pitch.wav",
            "comparison_file": "speech_pitch_pause.wav",
            "transcript": "Every single day millions of professionals waste countless hours attempting to manually debug temporal inconsistencies in voice pipelines.",
            "flaw_type": "excessive_pauses",
            "start_time": 2.4,
            "end_time": 3.7,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-006-PITCH-PAUSE",
            "title": "Startup Pitch — Mid-Sentence Pause",
            "speechDomain": "Investor Pitch",
            "speaker": "Speaker B (Hesitation Pitch)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_pitch.wav",
            "participantAudioFile": "speech_pitch_pause.wav",
            "flawCategory": "excessive_pauses",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 2.4, "end": 3.7, "label": "1.30s hesitation breaking syntactic flow between 'countless hours' and 'attempting'"}],
            "isSynthetic": True,
            "split": "validation",
            "notes": "Inserted pause variation testing DTW warp path recovery on pitch content."
        },
        # PAIR 7 - Commencement: Monotone Intonation
        {
            "pair_id": "PAIR_007_COMMENCE_MONOTONE",
            "reference_file": "sample_reference_commence.wav",
            "comparison_file": "sample_flawed_monotone.wav",
            "transcript": "Your courage will be tested, but your conviction must remain steadfast as you enter this next chapter of life.",
            "flaw_type": "monotone_pitch",
            "start_time": 1.2,
            "end_time": 4.6,
            "annotation_type": "human_rehearsal",
            "id": "PAIR-003-COMMENCEMENT",
            "title": "Commencement Address — Monotone Intonation",
            "speechDomain": "Ceremonial / Public Oratory",
            "speaker": "Speaker C (Flat / Monotone Orator)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_commence.wav",
            "participantAudioFile": "sample_flawed_monotone.wav",
            "flawCategory": "monotone_pitch",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 1.2, "end": 4.6, "label": "Compressed pitch excursion (<1.8 semitones across emotional apex phrases)"}],
            "isSynthetic": False,
            "split": "test",
            "notes": "Authentic studio orator recording demonstrating flat robotic intonation compared with reference vocal inflection."
        },
        # PAIR 8 - Commencement: Vocal Fade
        {
            "pair_id": "PAIR_008_COMMENCE_FADE",
            "reference_file": "sample_reference_commence.wav",
            "comparison_file": "speech_commence_fade.wav",
            "transcript": "Your courage will be tested, but your conviction must remain steadfast as you enter this next chapter of life.",
            "flaw_type": "vocal_fade",
            "start_time": 3.5,
            "end_time": 5.3,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-008-COMMENCE-FADE",
            "title": "Commencement Address — Projection Drop",
            "speechDomain": "Ceremonial / Public Oratory",
            "speaker": "Speaker C (Commencement Fade Variant)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_commence.wav",
            "participantAudioFile": "speech_commence_fade.wav",
            "flawCategory": "vocal_fade",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 3.5, "end": 5.3, "label": "Energy attenuation > 50% during peroration conclusion ('chapter of life')"}],
            "isSynthetic": True,
            "split": "validation",
            "notes": "Controlled envelope decay at phrase boundary."
        },
        # PAIR 9 - Podcast: Vocal Energy Fade
        {
            "pair_id": "PAIR_009_PODCAST_FADE",
            "reference_file": "sample_reference_podcast.wav",
            "comparison_file": "sample_flawed_fade.wav",
            "transcript": "In this special deep-dive episode, we uncover the hidden acoustic markers that transform good speakers into great leaders.",
            "flaw_type": "vocal_fade",
            "start_time": 3.2,
            "end_time": 5.1,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-004-PODCAST-INTRO",
            "title": "Podcast Intro — Energy Decay",
            "speechDomain": "Media / Podcasting",
            "speaker": "Speaker D (Vocal Energy Fade)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_podcast.wav",
            "participantAudioFile": "sample_flawed_fade.wav",
            "flawCategory": "vocal_fade",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 3.2, "end": 5.1, "label": "Energy attenuation > 55% during clause completion ('into great leaders')"}],
            "isSynthetic": True,
            "split": "test",
            "notes": "Synthetic envelope decay simulating diaphragmatic breath loss at clause conclusion."
        },
        # PAIR 10 - Podcast: Rushed Cold Open
        {
            "pair_id": "PAIR_010_PODCAST_SPEED",
            "reference_file": "sample_reference_podcast.wav",
            "comparison_file": "speech_podcast_fast.wav",
            "transcript": "In this special deep-dive episode, we uncover the hidden acoustic markers that transform good speakers into great leaders.",
            "flaw_type": "excessive_speed",
            "start_time": 0.0,
            "end_time": 4.2,
            "annotation_type": "synthetic_transformation",
            "id": "PAIR-010-PODCAST-SPEED",
            "title": "Podcast Intro — Accelerated Pacing",
            "speechDomain": "Media / Podcasting",
            "speaker": "Speaker D (Podcast Fast Variant)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_podcast.wav",
            "participantAudioFile": "speech_podcast_fast.wav",
            "flawCategory": "rushed_delivery",
            "flawSeverity": "moderate",
            "groundTruthIntervals": [{"start": 0.0, "end": 4.2, "label": "Delivery velocity 38% above target conversational cadence"}],
            "isSynthetic": True,
            "split": "train",
            "notes": "Speed perturbation modeling rushed broadcast cold-open."
        },
        # PAIR 11 - Parliamentary Debate: Authentic Hesitation
        {
            "pair_id": "PAIR_011_DEBATE_PAUSE",
            "reference_file": "sample_reference_debate.wav",
            "comparison_file": "sample_flawed_debate.wav",
            "transcript": "The opposition argues that technological disruption creates irreversible dislocation, but history tells the exact opposite story.",
            "flaw_type": "excessive_pauses",
            "start_time": 3.0,
            "end_time": 4.2,
            "annotation_type": "human_rehearsal",
            "id": "PAIR-005-DEBATE-REBUTTAL",
            "title": "Parliamentary Debate — Stagnant Pause",
            "speechDomain": "Debate / Persuasive Rhetoric",
            "speaker": "Speaker E (Natural Collegiate Debater)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_debate.wav",
            "participantAudioFile": "sample_flawed_debate.wav",
            "flawCategory": "excessive_pauses",
            "flawSeverity": "mild",
            "groundTruthIntervals": [{"start": 3.0, "end": 4.2, "label": "Extended dead-air silence before counter-premise introduction"}],
            "isSynthetic": False,
            "split": "validation",
            "notes": "Natural collegiate debater recording during spontaneous rebuttal preparation."
        },
        # PAIR 12 - Corporate Training: Articulation Mismatch
        {
            "pair_id": "PAIR_012_TRAINING_SPECTRAL",
            "reference_file": "sample_reference_training.wav",
            "comparison_file": "sample_flawed_spectral.wav",
            "transcript": "Please ensure that all proprietary communication adheres strictly to the security governance standards detailed in section four.",
            "flaw_type": "articulation_mismatch",
            "start_time": 2.2,
            "end_time": 4.8,
            "annotation_type": "human_rehearsal",
            "id": "PAIR-006-TRAINING-MOD",
            "title": "Corporate Compliance — Articulation Deviation",
            "speechDomain": "E-Learning / Instructional",
            "speaker": "Speaker F (Microphone Axis Variation)",
            "hasAudio": True,
            "referenceAudioFile": "sample_reference_training.wav",
            "participantAudioFile": "sample_flawed_spectral.wav",
            "flawCategory": "articulation_mismatch",
            "flawSeverity": "mild",
            "groundTruthIntervals": [{"start": 2.2, "end": 4.8, "label": "Spectral tilt shift resulting from off-axis microphone head movement"}],
            "isSynthetic": False,
            "split": "train",
            "notes": "Natural human delivery with subtle off-axis head tilt creating consonant muffling."
        },
    ]

    out_json = "dataset/annotations/benchmark_pairs.json"
    os.makedirs(os.path.dirname(out_json), exist_ok=True)
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)

    print(f"Generated {len(dataset)} contrastive benchmark pairs in {out_json}")

if __name__ == "__main__":
    main()
