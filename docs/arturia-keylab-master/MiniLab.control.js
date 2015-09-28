// Controller Script for the Arturia MiniLab

loadAPI(1);

load ("Extensions.js");

host.defineController("Arturia", "MiniLab", "1.0", "e48ffd90-3203-11e4-8c21-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Arturia MINILAB"], ["Arturia MINILAB"]);
host.addDeviceNameBasedDiscoveryPair(["Arturia MINILAB MIDI 1"], ["Arturia MINILAB MIDI 1"]);
host.defineSysexIdentityReply("F0 7E 00 06 02 00 20 6B 02 00 04 0? ?? ?? ?? ?? F7");


var Knobs1 = [7, 74, 71, 76, 77, 93, 73, 75];
var Knobs2 = [114, 18, 19, 16, 17, 91, 79, 72];
var Pad1 = [22, 23, 24, 25, 26, 27, 28, 29];
var Mode = "Track";
var SubMode = "VolPan";
var tName = "None";
var tNameHasChanged = false;
var dName = "None";
var dNameHasChanged = false;
var pName = "None";
var presetHasChanged = false;
var pageNames = [];
var pageNumber = 0;
var pageHasChanged = false;

var padShift = 0;
var padshiftHasChanged = true;
var padTranslation = initArray(0, 128);

function init()
{
   // Create the Note Inputs and their Settings
   MiniLabKeys = host.getMidiInPort(0).createNoteInput("MiniLab Keys", "80????", "90????", "B001??", "B002??", "B007??", "B00B??", "B040??", "C0????", "D0????", "E0????");
   MiniLabKeys.setShouldConsumeEvents(false);
   MiniLabPads = host.getMidiInPort(0).createNoteInput("MiniLab Pads", "?9????");
   MiniLabPads.setShouldConsumeEvents(false);
   MiniLabPads.assignPolyphonicAftertouchToExpression(0, NoteExpression.TIMBRE_UP, 2);


   // Setting Callbacks for Midi and Sysex
   host.getMidiInPort(0).setMidiCallback(onMidi);
   host.getMidiInPort(0).setSysexCallback(onSysex);

   setNoteTable(MiniLabPads, padTranslation, padShift);

   // Creating the main objects:
   transport = host.createTransport();
   tracks = host.createTrackBank(8, 2, 0);
   cTrack = host.createCursorTrack(3, 0);
   cDevice = cTrack.getPrimaryDevice();
   uControl = host.createUserControls(16);

   setIndications("track");

   for (var i = 0; i < 8; i++) {
      uControl.getControl(i).setLabel("CC " + Knobs1[i])
      uControl.getControl(i + 8).setLabel("CC " + Knobs2[i])
   }

   cTrack.addNameObserver(50, "None", function(name){
      tName = name;
      if (tNameHasChanged) {
         //host.showPopupNotification("Track: " + name);
         tNameHasChanged = false;
      }
   });

   cDevice.addNameObserver(50, "None", function(name){
      dName = name;
      if (dNameHasChanged) {
         //host.showPopupNotification("Device: " + name);
         dNameHasChanged = false;
      }
   });

   cDevice.addPresetNameObserver(50, "None", function(name){
      pName = name;
      if (presetHasChanged) {
         //host.showPopupNotification("Preset: " + name);
         presetHasChanged = false;
      }
   });

   cDevice.addPageNamesObserver(function(name) {
      pageNames = [];
      for(var j = 0; j < arguments.length; j++) {
         pageNames[j] = arguments[j];
      }
   });

   cDevice.addSelectedPageObserver(-1, function(val) {
      pageNumber = val;
      if (pageHasChanged) {
         //host.showPopupNotification("Parameter Page " + (val+1) + ": " + pageNames[val]);
         pageHasChanged = false;
      }
   });

   try {
      host.getNotificationSettings().setShouldShowSelectionNotifications (true);
      host.getNotificationSettings().setShouldShowChannelSelectionNotifications (true);
      host.getNotificationSettings().setShouldShowTrackSelectionNotifications (true);
      host.getNotificationSettings().setShouldShowDeviceSelectionNotifications (true);
      host.getNotificationSettings().setShouldShowDeviceLayerSelectionNotifications (true);
      host.getNotificationSettings().setShouldShowPresetNotifications (true);
      host.getNotificationSettings().setShouldShowMappingNotifications (true);
      host.getNotificationSettings().setShouldShowValueNotifications (true);
   } catch(e) {
   }

   host.scheduleTask(pollState, null, 500);
}

function pollState() {
   sendSysex("F0 00 20 6B 7F 42 01 00 00 2F F7");
}


function onMidi(status, data1, data2) {
   // Instantiate the MidiData Object for convenience:
   var midi = new MidiData(status, data1, data2);

   //printMidi(midi.status, midi.data1, midi.data2);
   //println(midi.channel());

   if (midi.isChannelController()) {
      switch (midi.data1) {
         case Pad1[0]:
            if (midi.isOn()) {
               Mode = "Track";
               host.showPopupNotification("Mix Mode");
            }
            else {
               setIndications("track");
            }
            break;
         case Pad1[1]:
            if (midi.isOn()) {
               Mode = "Device";
               host.showPopupNotification("Device Mode");
            }
            else {
               setIndications("device");
            }
            break;
         case Pad1[2]:
            if (midi.isOn()) {
               Mode = "Preset";
               host.showPopupNotification("Preset Mode");
            }
            else {
               setIndications("preset");
            }
            break;
         case Pad1[3]:
            if (midi.isOn()) {
               Mode = "Arturia";
               host.showPopupNotification(Mode + " Mode");
            }
            else {
               setIndications("arturia");
            }
            break;
         case Pad1[4]:
            switch (Mode) {
               case "Track":
                  if (midi.isOn()) {
                  SubMode = "VolPan";
                     host.showPopupNotification("Volume & Pan");
                  }
                  else {
                     setIndications("track");
                  }
                  break;
               case "Device":
                  if (midi.isOn()) {
                     dNameHasChanged = true;
                     cDevice.switchToDevice(DeviceType.ANY, ChainLocation.PREVIOUS);
                  }
                  break;
               case "Preset":
                  if (midi.isOn()) {
                     pageHasChanged = true;
                     cDevice.previousParameterPage();
                  }
                  break;
               case "Arturia":
                  break;
            }
            break;
         case Pad1[5]:
            switch (Mode) {
               case "Track":
                  if (midi.isOn()) {
                     SubMode = "Send";
                     host.showPopupNotification("Sends");
                  }
                  else {
                     setIndications("send");
                  }
                  break;
               case "Device":
                  if (midi.isOn()) {
                     dNameHasChanged = true;
                     cDevice.switchToDevice(DeviceType.ANY, ChainLocation.NEXT);
                  }
                  break;
               case "Preset":
                  if (midi.isOn()) {
                     pageHasChanged = true;
                     cDevice.nextParameterPage();
                  }
                  break;
            }
            break;
         case Pad1[6]:
            switch (Mode) {
               case "Track":
                  if (midi.isOn()) {
                     tracks.scrollTracksUp();
                  }
                  break;
               case "Device":
                  if (midi.isOn()) {
                     tNameHasChanged = true;
                     cTrack.selectPrevious();
                  }
                  break;
               case "Preset":
                  if (midi.isOn()) {
                     presetHasChanged = true;
                     cDevice.switchToPreviousPreset();
                  }
                  break;
               case "Arturia":
                  if (midi.isOn()) {
                     if (padShift > -24) {
                        padShift -= 8;
                        var padOffset = (padShift > 0 ? "+" : "") + padShift/8;
                        host.showPopupNotification("Drum Bank Shift: " + padOffset);
                        setNoteTable(MiniLabPads, padTranslation, padShift);
                     }
                  }
                  break;
            }
            break;
         case Pad1[7]:
            switch (Mode) {
               case "Track":
                  if (midi.isOn()) {
                     tracks.scrollTracksDown();
                  }
                  break;
               case "Device":
                  if (midi.isOn()) {
                     tNameHasChanged = true;
                     cTrack.selectNext();
                  }
                  break;
               case "Preset":
                  if (midi.isOn()) {
                     presetHasChanged = true;
                     cDevice.switchToNextPreset();
                  }
                  break;
               case "Arturia":
                  if (midi.isOn()) {
                     if (padShift < 50) {
                        padShift += 8;
                        var padOffset = (padShift > 0 ? "+" : "") + padShift/8;
                        host.showPopupNotification("Drum Bank Shift: " + padOffset);
                        setNoteTable(MiniLabPads, padTranslation, padShift);
                     }
                  }
                  break;
            }
            break;
         default:
            for (var i = 0; i < 8; i++) {
               if (midi.data1 === Knobs1[i]) {
                  knobFunc(1, i, midi);
               }
               else if (midi.data1 === Knobs2[i]) {
                  knobFunc(2, i, midi);
               }
            }
      }
   }
}

function onSysex(data) {
   printSysex(data);
   println(data);
}

function knobFunc(Row, index, midi) {
   var inc = (midi.data2 - 64) * 0.1;
   //println(inc);
   switch (Mode) {
      case "Track":
         if (SubMode === "VolPan") {
            if (Row === 1) {
               tracks.getTrack(index).getVolume().inc(inc, 256);
            }
            else {
               tracks.getTrack(index).getPan().inc(inc, 128);
            }
         }
         else {
            if (Row === 1) {
               tracks.getTrack(index).getSend(0).inc(inc, 128);
            }
            else {
               tracks.getTrack(index).getSend(1).inc(inc, 128);
            }
         }
         break;
      case "Device":
         if (Row === 1) {
            cDevice.getMacro(index).getAmount().inc(inc, 128);
         }
         else {
            cDevice.getCommonParameter(index).inc(inc, 128);
         }
         break;
      case "Preset":
         if (Row === 1) {
            cDevice.getEnvelopeParameter(index).inc(inc, 128);
         }
         else {
            cDevice.getParameter(index).inc(inc, 128);
         }
         break;
      case "Arturia":
         MiniLabKeys.sendRawMidiEvent(midi.status, midi.data1, midi.data2);
         if (Row === 1) {
            uControl.getControl(index).inc(inc, 128);
         }
         else {
            uControl.getControl(index + 8).inc(inc, 128);
         }

         break;
   }
}

function setIndications() {
   var track = false;
   var send = false;
   var device = false;
   var preset = false;
   var arturia = false;

   // Pad Light feedback disabled because of we have no way of knowing what mode the MiniLab is in.

   //sendSysex("F0 00 20 6B 7F 42 02 00 10 78 00 F7");
   //sendSysex("F0 00 20 6B 7F 42 02 00 10 79 00 F7");
   //sendSysex("F0 00 20 6B 7F 42 02 00 10 7A 00 F7");
   //sendSysex("F0 00 20 6B 7F 42 02 00 10 7B 00 F7");
   //sendSysex("F0 00 20 6B 7F 42 02 00 10 7C 00 F7");
   //sendSysex("F0 00 20 6B 7F 42 02 00 10 7D 00 F7");
   //sendSysex("F0 00 20 6B 7F 42 02 00 10 7E 00 F7");
   //sendSysex("F0 00 20 6B 7F 42 02 00 10 7F 00 F7");
   switch (Mode) {
      case "Track":
         if (SubMode === "VolPan") {
            track = true;
            //sendSysex("F0 00 20 6B 7F 42 02 00 10 78 01 F7");
            //sendSysex("F0 00 20 6B 7F 42 02 00 10 7C 01 F7");
         }
         else {
            send = true;
            //sendSysex("F0 00 20 6B 7F 42 02 00 10 78 01 F7");
            //sendSysex("F0 00 20 6B 7F 42 02 00 10 7D 01 F7");
         }
         break;
      case "Device":
         device = true;
         //sendSysex("F0 00 20 6B 7F 42 02 00 10 79 01 F7");
         break;
      case "Preset":
         preset = true;
         //sendSysex("F0 00 20 6B 7F 42 02 00 10 7A 01 F7");
         break;
      case "Arturia":
         arturia = true;
         //sendSysex("F0 00 20 6B 7F 42 02 00 10 7B 01 F7");
         break;
   }
   for (var i = 0; i < 8; i++) {
      tracks.getTrack(i).getVolume().setIndication(track);
      tracks.getTrack(i).getPan().setIndication(track);
      tracks.getTrack(i).getSend(0).setIndication(send);
      tracks.getTrack(i).getSend(1).setIndication(send);
      cDevice.getMacro(i).getAmount().setIndication(device);
      cDevice.getCommonParameter(i).setIndication(device);
      cDevice.getEnvelopeParameter(i).setIndication(preset);
      cDevice.getParameter(i).setIndication(preset);
      uControl.getControl(i).setIndication(arturia);
      uControl.getControl(i + 8).setIndication(arturia);
   }

}

function exit()
{
   // nothing to do here ;-)
}
