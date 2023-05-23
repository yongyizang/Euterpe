"""Assuming every note is 4 seconds long and consecutive, split the long audio file into a bunch of short note-by-note audios. default to mono.
"""

import os, sys
from pydub import AudioSegment
import librosa

# list of notes to name files
notes = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B']

def split_audio(file_path):
    # Load audio file
    audio = AudioSegment.from_file(file_path)
    
    # Convert to mono
    audio = audio.set_channels(1)
    
    # Calculate duration in seconds
    duration = len(audio) / 1000  # pydub works in milliseconds

    # Split the audio file into 4 second parts
    chunks = [audio[i:i+4000] for i in range(0, len(audio), 4000)]

    # Loop over chunks and save them
    count = 0
    octave = 0
    for i, chunk in enumerate(chunks):
        note = notes[count % 12] + str(octave)  # Get current note and octave

        # Save chunk to .wav file
        chunk.export(f"{note}.mp3", format="mp3")

        count += 1
        if count % 12 == 0:  # If we have cycled through all 12 notes, increase the octave
            octave += 1

# Provide your audio file path
audio_path = sys.argv[1]
split_audio(audio_path)
