function configureDeviceUsingSysex() {
   for(var i = 0; i < 10; i++) {
      configureEncoder(kL.sysexIDknobBank1[i], kL.knobBank1[i], true);
      configureEncoder(kL.sysexIDknobBank2[i], kL.knobBank2[i], true);
   }
   // Volume Encoder to relative:
   configureEncoder(0x30, 7, true);
   // Param Encoder to relative:
   configureEncoder(0x31, 112, true);
   // Value Encoder to relative
   configureEncoder(0x33, 114, true);

   // Set global Relative Mode:
   sendSysex("F0 00 20 6B 7F 42 02 00 40 02 7F F7");

   // Transport:
   // Rewind to MMC
   configureControls("5B", "07", "00", "05", "00", "7F");
   // Fast Forward to MMC
   configureControls("5C", "07", "00", "04", "00", "7F");
   // Stop to MMC
   configureControls("59", "07", "00", "01", "00", "7F");
   // Play to MMC
   configureControls("58", "07", "00", "02", "00", "7F");
   // Record to MMC
   configureControls("5A", "07", "00", "06", "00", "7F");
   // Loop to CC 55
   configureControls("5D", "08", "00", "37", "00", "7F");

   // Button Row:
   // Button Prog. Chng.
   configureControls("12", "05", "00", "16", "16", "68");
   // Button Recall
   configureControls("13", "05", "00", "17", "17", "69");
   // Button Store
   configureControls("14", "05", "00", "18", "18", "6A");
   // Button Global
   configureControls("15", "05", "00", "19", "19", "6B");
   // Button Curve
   configureControls("16", "05", "00", "1A", "1A", "6C");
   // Button Mode
   configureControls("17", "05", "00", "1B", "1B", "6D");
   // Button Midi Ch.
   configureControls("18", "05", "00", "1C", "1C", "6E");
   // Button CC
   configureControls("19", "05", "00", "1D", "1D", "6F");
   // Button Min LSB
   configureControls("1A", "05", "00", "1E", "1E", "74");
   // Button Max MSB
   configureControls("1B", "05", "00", "1F", "1F", "75");

   // Bank 1
   configureControls("1D", "01", "00", "2F", "00", "7F");
   // Bank 2
   configureControls("1C", "01", "01", "2E", "00", "7F");

   // Sound
   configureControls("1E", "01", "00", "76", "00", "7F");
   // Multi
   configureControls("1F", "01", "00", "77", "00", "7F");

   // Fader 1 - 9 / Bank 1 & 2
   configureControls("0B", "01", "00", "49", "00", "7F");
   configureControls("2B", "01", "00", "43", "00", "7F");

   configureControls("0C", "01", "00", "4B", "00", "7F");
   configureControls("2C", "01", "00", "44", "00", "7F");

   configureControls("0D", "01", "00", "4F", "00", "7F");
   configureControls("2D", "01", "00", "45", "00", "7F");

   configureControls("0E", "01", "00", "48", "00", "7F");
   configureControls("2E", "01", "00", "46", "00", "7F");

   configureControls("4B", "01", "00", "50", "00", "7F");
   configureControls("6B", "01", "00", "57", "00", "7F");

   configureControls("4C", "01", "00", "51", "00", "7F");
   configureControls("6C", "01", "00", "58", "00", "7F");

   configureControls("4D", "01", "00", "52", "00", "7F");
   configureControls("6D", "01", "00", "59", "00", "7F");

   configureControls("4E", "01", "00", "53", "00", "7F");
   configureControls("6E", "01", "00", "5A", "00", "7F");

   configureControls("4F", "01", "00", "55", "00", "7F");
   configureControls("6F", "01", "00", "5C", "00", "7F");
}

function resetKeyLabToAbsoluteMode() {
   // Set Encoders back to absolute:
   for(var i = 0; i < 10; i++) {
      configureEncoder(kL.sysexIDknobBank1[i], kL.knobBank1[i], false);
      configureEncoder(kL.sysexIDknobBank2[i], kL.knobBank2[i], false);
   }
   // Volume Encoder to Absolute:
   configureEncoder(0x30, 7, false);
   // Set global Absolute Mode:
   sendSysex("F0 00 20 6B 7F 42 02 00 40 02 01 F7");
}

function configureControls(index, value1, value2, value3, value4, value5) {
   sendSysex("F0 00 20 6B 7F 42 02 00 01 " + index + " " + value1 + " F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 02 " + index + " " + value2 + " F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 03 " + index + " " + value3 + " F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 04 " + index + " " + value4 + " F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 05 " + index + " " + value5 + " F7");
}

function configureEncoder(index, cc, relative) {
   if(relative) {
      var mode = uint7ToHex(2); // 2 == relative
   }
   else {
      var mode = uint7ToHex(1); // 1 == absolute
   }
   var indexHex = uint7ToHex(index);
   var ccHex = uint7ToHex(cc);
   var min = uint7ToHex(0);
   var max = uint7ToHex(127);

   sendSysex("F0 00 20 6B 7F 42 02 00 01" + indexHex + mode + "F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 02" + indexHex + "00 F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 03" + indexHex + ccHex + "F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 04" + indexHex + min + "F7");
   sendSysex("F0 00 20 6B 7F 42 02 00 05" + indexHex + max + "F7");
}
