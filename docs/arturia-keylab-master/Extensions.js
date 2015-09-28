// Wrapper around often used Midi functionality to reduce clutter in onMidi:
function MidiData(status, data1, data2) {
   this.status = status;
   this.data1 = data1;
   this.data2 = data2;
}

MidiData.prototype = {
   // Note Name Array:
   noteNames: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],

   // Midi Channel:
   channel: function() {
      return(this.status & 0xF);
   },

   // Booleans for message type:
   isNoteOff: function() {
      return((this.status & 0xF0) === 0x80) || ((this.status & 0xF0) === 0x90 && this.data2 === 0);
   },
   isNoteOn: function() {
      return(this.status & 0xF0) === 0x90;
   },
   isKeyPressure: function() {
      return(this.status & 0xF0) === 0xA0;
   },
   isChannelController: function() {
      return(this.status & 0xF0) === 0xB0;
   },
   isProgramChange: function() {
      return(this.status & 0xF0) === 0xC0;
   },
   isChannelPressure: function() {
      return(this.status & 0xF0) === 0xD0;
   },
   isPitchBend: function() {
      return(this.status & 0xF0) === 0xE0;
   },
   isMTCQuarterFrame: function() {
      return(this.status === 0xF1);
   },
   isSongPositionPointer: function() {
      return(this.status === 0xF2);
   },
   isSongSelect: function() {
      return(this.status === 0xF3);
   },
   isTuneRequest: function() {
      return(this.status === 0xF6);
   },
   isTimingClock: function() {
      return(this.status === 0xF8);
   },
   isMIDIStart: function() {
      return(this.status === 0xFA);
   },
   isMIDIContinue: function() {
      return(this.status === 0xFB);
   },
   isMIDIStop: function() {
      return(this.status === 0xFC);
   },
   isActiveSensing: function() {
      return(this.status === 0xFE);
   },
   isSystemReset: function() {
      return(this.status === 0xFF);
   },

   // Message Type
   type: function() {
      var test = this.status & 0xF0;
      switch(test) {
         case 0x80:
            return "NoteOff";
         case 0x90:
            // Note on with Velocity 0 is also considered Note Off:
            if(this.data1 === 0) {
               return "NoteOff";
            }
            else {
               return "NoteOn";
            }
         case 0xA0:
            return "KeyPressure";
         case 0xB0:
            return "CC";
         case 0xC0:
            return "ProgramChange";
         case 0xD0:
            return "ChannelPressure";
         case 0xE0:
            return "PitchBend";
      };
      return "Other";
   },

   // For CCs when used as switches:
   isOn: function() {
      return(this.data2 > 64);
   },
   isOff: function() {
      return(this.data2 < 64);
   },

   // Ranges:
   data1IsInRange: function(low, high) {
      return(this.data1 >= low && this.data1 <= high);
   },
   data2IsInRange: function(low, high) {
      return(this.data2 >= low && this.data2 <= high);
   },

   // Notes:
   note: function() {
      return this.isNoteOn() ? this.noteNames[this.data1 % 12] : false;
   },
   octave: function() {
      return this.isNoteOn() ? Math.floor((this.data1 / 12) - 2) : false;
   },
   noteOctave: function() {
      return this.isNoteOn() ? (this.note() + " " + this.octave()) : false;
   }
}

// A function to set the Note Table for Midi Inputs and add / subtrackt an Offset to Transpose:
function setNoteTable(midiIn, table, offset) {
      for(var i = 0; i < 128; i++) {
         table[i] = offset + i;
         // If the result is out of the MIDI Note Range, set it to -1 so the Note is not played:
         if(table[i] < 0 || table[i] > 127) {
            table[i] = -1;
         }
      }
      // Finally set the Key Translation Table of the respective MidiIn:
      midiIn.setKeyTranslationTable(table);
   } // End setNoteTable.

function printObject(object) {
   var x;
   for(x in Object) {
      println(x);
   }
}
