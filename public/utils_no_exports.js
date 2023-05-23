class Node {
    constructor(value) {
      this.value = value;
      this.next = null;
    }
  }
  
class LIFOQueue {
    constructor(maxLength) {
        this.head = null;
        this.maxLength = maxLength;
        this.size = 0;
    }

    push(element) {
        const newNode = new Node(element);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;

        if (this.size > this.maxLength) {
            this.pop(); // Remove the oldest element
        }
    }

    pop() {
        if (this.head === null) {
            return undefined; // Queue is empty
        }
        const poppedValue = this.head.value;
        this.head = this.head.next;
        this.size--;

        return poppedValue;
    }
    
    length() {
        return this.size;
    }

    clear() {
        this.head = null;
        this.size = 0;
      }
    
    toArray() {
        const arr = [];
        let current = this.head;
        while (current !== null) {
            arr.push(current.value);
            current = current.next;
        }
        return arr;
    }
    toArrayAndClear() {
        const arr = [];
        while (this.head !== null) {
          arr.push(this.pop());
        }
        return arr;
      }
}

class FIFOQueue {
    constructor(maxLength) {
        this.head = null;
        this.tail = null;
        this.maxLength = maxLength;
        this.size = 0;
    }

    push(element) {
        const newNode = new Node(element);

        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.size++;

        if (this.size > this.maxLength) {
            this.pop(); // Remove the oldest element
        }
    }

    pop() {
        if (this.head === null) {
            return undefined; // Queue is empty
        }

        const poppedValue = this.head.value;
        this.head = this.head.next;

        if (this.head === null) {
            this.tail = null;
        }

        this.size--;

        return poppedValue;
    }

    length() {
        return this.size;
    }
}

/**
 * Interleaved -> Planar audio buffer conversion
 *
 * This is useful to get data from a codec, the network, or anything that is
 * interleaved, into a planar format, for example a Web Audio API AudioBuffer or
 * the output parameter of an AudioWorkletProcessor.
 *
 * @param {Float32Array} input is an array of n*sampleLength samples, interleaved,
 * where n is the channel count.
 * @param {Float32Array} output is an 2d array of n x sampleLength dimension.
 */
function deinterleave_custom(input, output, channel_count) {
    // const channel_count = input.length / 256;
    const sampleLength = input.length / channel_count;
    if (output.length !== channel_count) {
      throw RangeError("not enough space in output arrays");
    }
    for (let i = 0; i < channel_count; i++) {
      const out_channel = output[i];
      let interleaved_idx = i;
      for (let j = 0; j < sampleLength; ++j) {
        out_channel[j] = input[interleaved_idx];
        interleaved_idx += channel_count;
      }
    }
  }

function simulateBlockingOperation(delay) {
    // Simulate a 100ms blocking operation
    const startTime = Date.now();
    while (Date.now() - startTime < delay) {
        // Blocking loop
    }
}

function shiftRight(arr) {
    const lastElement = arr.pop();
    arr.unshift(lastElement);
}

function average2d(arr) {
    let suma = new Array(arr[0].length).fill(0);

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            suma[j] += arr[i][j];
        }
    }
    const tickAverageChroma = suma.map((sum) => sum / arr.length);
    return tickAverageChroma;
}