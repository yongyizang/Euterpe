/* eslint-disable require-jsdoc */
class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export class LIFOQueue {
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

export class FIFOQueue {
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
