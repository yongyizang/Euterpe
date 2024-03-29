import {note, transpose} from '@tonaljs/tonal';
import {enharmonic} from '@tonaljs/note';

/**
 * TODO: Add description
 * @param {string} from
 * @param {string} to
 * @return {list}
 */
export function createRange(from, to) {
    let fromNote = note(from);
    const toNote = note(to);

    if (fromNote.height >= toNote.height) {
        throw new Error('Reverse ranges are not yet implemented.');
    }

    if (fromNote.acc === 'b') {
        fromNote = note(enharmonic(fromNote));
    }

    const range = [];

    for (let i = 0, l = toNote.height - fromNote.height, currNote = fromNote; i < l; i++) {
        range.push(currNote);
        currNote = note(enharmonic(transpose(currNote, 'm2')));
    }

    return range;
}
