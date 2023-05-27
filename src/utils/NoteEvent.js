export class NoteEvent {
    constructor(player, instrument, 
                eventSource,
                name, type, 
                midi, 
                chroma = null,
                channel = null,
                velocity = 127, 
                createdAt = null, 
                playAfter = null, 
                duration = null, 
                )
                 {
      this._player = player;
      this._instrument = instrument;
      this._eventSource = eventSource;
      this._name = name;
      this._type = type;
      this._midi = midi;
      this._chroma = chroma;
      this._channel = channel;
      this._velocity = velocity;
      this._createdAt = createdAt;
      this._playAfter = playAfter;
      this._duration = duration;
      this._playAt = null;
    }
  
  // copy - static method
    static fromPlain(noteEvent) {
        let newNoteEvent = new NoteEvent(noteEvent._player, noteEvent._instrument,
            noteEvent._eventSource,
            noteEvent._name, noteEvent._type,
            noteEvent._midi, noteEvent._chroma,
            noteEvent._channel, noteEvent._velocity,
            noteEvent._createdAt, noteEvent._playAfter,
            noteEvent._duration);
        newNoteEvent._playAt = noteEvent._playAt;
        return newNoteEvent;
    }

  // copy - static method
  static copy(noteEvent) {
    let copy = new NoteEvent(noteEvent.player, noteEvent.instrument,
      noteEvent.eventSource,
      noteEvent.name, noteEvent.type,
      noteEvent.midi, noteEvent.chroma,
      noteEvent.channel, noteEvent.velocity,
      noteEvent.createdAt, noteEvent.playAfter,
      noteEvent.duration);
    copy._playAt = noteEvent._playAt;
    return copy;
  }

    // Getters
    get player() {
      return this._player;
    }
  
    get instrument() {
      return this._instrument;
    }
    
    get eventSource() {
        return this._eventSource;
    }

    get name() {
      return this._name;
    }
  
    get type() {
      return this._type;
    }
  
    get midi() {
      return this._midi;
    }

    get chroma() {
        return this._chroma;
    }
  
    get channel() {
        return this._channel;
    }

    get velocity() {
      return this._velocity;
    }
  
    get createdAt() {
      return this._createdAt;
    }
  
    get playAfter() {
      return this._playAfter;
    }
  
    get duration() {
      return this._duration;
    }
  
    // get playAt() {
    //   return this._playAt;
    // }
  
    // Setters
    set player(value) {
      this._player = value;
    }
  
    set instrument(value) {
      this._instrument = value;
    }
    
    set eventSource(value) {
        this._eventSource = value;
    }

    set name(value) {
      this._name = value;
    }
  
    set type(value) {
      this._type = value;
    }
  
    set midi(value) {
      this._midi = value;
    }
  
    set chroma(value) {
        this._chroma = value;
    }

    set channel(value) {
        this._channel = value;
    }

    set velocity(value) {
      this._velocity = value;
    }
  
    set createdAt(value) {
      this._createdAt = value;
    }
  
    set playAfter(value) {
      this._playAfter = value;
    }
  
    set duration(value) {
      this._duration = value;
    }
  
    // set playAt(value) {
    //   this._playAt = value;
    // }
  }