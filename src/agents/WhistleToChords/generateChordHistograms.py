import json

def generate_chord_histogram(root_index, chord_type):
    histogram = [0] * 12
    for index in chord_type:
        note_index = (root_index + index) % 12
        histogram[note_index] = 1
    return histogram

notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

chord_types = {
    'maj': [0, 4, 7],
    'min': [0, 3, 7],
    'maj7': [0, 4, 7, 11],
    '7': [0, 4, 7, 10],
    'min7': [0, 3, 7, 10],
}

chord_histograms = {}

for root_note_index, root_note in enumerate(notes):
    chord_histograms[root_note] = {}
    for chord_type, indices in chord_types.items():
        chord_histogram = generate_chord_histogram(root_note_index, indices)
        chord_histograms[root_note][chord_type] = chord_histogram



# Save the results in a JSON file
with open('chord_histograms.json', 'w') as json_file:
    json.dump(chord_histograms, json_file, indent=4)

with open('chord_histograms_minimized.json', 'w') as json_file:
    json.dump(chord_histograms, json_file, separators=(',', ':'))
print("Chord histograms saved in chord_histograms.json")