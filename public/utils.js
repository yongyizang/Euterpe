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
}