import {
    euterpeNoteToBachDuetNote,
    bachDuetNoteToEuterpeNote,
    euterpeTickToBachDuetTick,
    bachDuetInference,
} from './bachDuetUtils.js';

/**
 * Processes a clock event and returns a message with the agent's output notes.
 * @param {Object} content - The clock event content.
 * @return {Object} - The message with the agent's output notes.
 */
export function processClockEvent(content) {
    const numUserNotes = content.humanQuantizedInput.length;
    if (numUserNotes > 1) {
        console.error('BachDuet can only handle monophonic input. ' +
        'Make sure to set polyphony.input:1 in config.yaml');
    }
    // If there is no user note, BachDuet expects the a 'rest' token/note
    let userInputBD;
    if (numUserNotes == 0) {
        userInputBD = self.restNote;
    } else {
        userInputBD = euterpeNoteToBachDuetNote(content.humanQuantizedInput[0]);
    }
    // Convert the tick from Euterpe's format to BachDuet's format
    const tickBD = euterpeTickToBachDuetTick(content.tick);

    // Prepare the input tensors for the neural network
    const midiInputTensor = tf.tensor2d([[self.lastBachDuetNote.midiArticInd,
        userInputBD.midiArticInd]]);
    const cpcInputTensor = tf.tensor2d([[self.lastBachDuetNote.cpc, userInputBD.cpc]]);
    const tickTensor = tf.tensor2d([[tickBD]]);

    // Neural network inference
    const currentBachDuetNote = bachDuetInference(midiInputTensor, cpcInputTensor, tickTensor);

    // Convert the bachDuet's note output to Euterpe's note format
    const agentOutputNoteList = bachDuetNoteToEuterpeNote(currentBachDuetNote);

    // Update the last note (it'll be used in the next tick)
    self.lastBachDuetNote = currentBachDuetNote;

    // Add your messages to Euterpe here
    const message = {
        [self.messageType.NOTE_LIST]: agentOutputNoteList,
    };

    return message;
}
