/* eslint-disable require-jsdoc */
export function shiftRight(arr) {
    const lastElement = arr.pop();
    arr.unshift(lastElement);
}

// Find the maximum of a 1d array
// and the index of the maximum
export function max1d(arr) {
    let max = 0;
    let maxIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
            maxIndex = i;
        }
    }
    return [max, maxIndex];
}

export function average1d(arr) {
    // Handle the case of an empty array to avoid division by zero.
    if (arr.length === 0) {
        return 0;
    }
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

export function average2d(arr) {
    const suma = new Array(arr[0].length).fill(0);

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            suma[j] += arr[i][j];
        }
    }
    return suma.map((sum) => sum / arr.length);
}

/*
  Clamp a number to a range.
*/
export function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
}

/* Clamp a midi note to a range. */
export function clampMidi(midi, min, max) {
    let clipedMidi = midi;
    while (clipedMidi < min) {
        clipedMidi += 12;
    }
    while (clipedMidi > max) {
        clipedMidi -= 12;
    }
    return clipedMidi;
}

/*
  Convert degrees to radians.
*/
export function degreesToRadians(angle) {
    return (-angle * Math.PI) / 180.0;
}

/*
  Convert radians to degrees.
*/
export function radiansToDegrees(angle) {
    return angle * (180 / Math.PI);
}

/*
  Convert a polar coordinate (r, θ) to cartesian (x, y).
*/
export function polarToCartesian(radius, theta) {
    const x = radius + radius * Math.cos(theta);
    const y = radius + radius * Math.sin(theta);

    return [x, y];
}

/*
  Convert a cartesian coordinate (x, y) to polar (r, θ).
*/
export function cartesianToPolar(x, y) {
    [x, y] = normalisePoint(x, y);

    const radius = Math.sqrt(x ** 2, y ** 2);
    const theta = Math.atan2(y, x);

    return [radius, theta];
}

/*
  "Normalises" a point, allowing functions to use:

  - Arrays     - `[1, 1]`
  - Vectors    - `new Vector2(1, 1)`
  - Objects    - `{ x: 1, y: 1 }`
  - Parameters - `x, y`
*/
export function normalisePoint(x, y) {
    if (Array.isArray(x)) {
        return x;
    } else if (typeof x === 'object') {
        if (x.x && x.y) {
            return [x.x, x.y];
        } else if (x.i && x.j) {
            return [x.i, x.j];
        } else {
            throw new Error('Invalid object.');
        }
    }

    return [x, y];
}

export class Vector2 {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }
}
