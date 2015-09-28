load("Extensions.js");
load("KeyLabInit.js");
load("Modes.js");

var kL = null;
var MODE = null;

// Main KeyLab Object:
function KeyLab() {
   // Midi Ports:
   //this.midiInKeys = host.getMidiInPort(0).createNoteInput("Keys", "?0????");
   this.midiInKeys = host.getMidiInPort(0).createNoteInput("Keys", "80????", "90????", "B001??", "B002??", "B00B??", "B040??", "C0????", "D0????", "E0????");
   // Disable the consuming of events by the NoteInputs, so they are also sent to onMidi:
   this.midiInKeys.setShouldConsumeEvents(false);

   // Check if Drumpads are available for the model, if yes, create an Input for them:
   if(DRUMPADS) {
      this.midiInPads = host.getMidiInPort(0).createNoteInput("Pads", "?9????");
      this.midiInPads.setShouldConsumeEvents(false);
      // Translate Poly AT to Timbre:
      this.midiInPads.assignPolyphonicAftertouchToExpression(9, NoteExpression.TIMBRE_UP, 2);
   }

   // Setting Callbacks for Midi and Sysex
   host.getMidiInPort(0).setMidiCallback(onMidi);
   host.getMidiInPort(0).setSysexCallback(onSysex);

   // Internal IDs used in sysex messages
   this.sysexIDknobBank1 = [1, 2, 3, 4, 9, 5, 6, 7, 8, 0x6e];
   this.sysexIDknobBank2 = [0x21, 0x22, 0x23, 0x24, 0x29, 0x25, 0x26, 0x27, 0x28, 0x2a];
   this.sysexIDbuttonBank = ["63", "64", "65", "66", "67", "68", "69", "6A", "6B", "62"];

   // Constant CC Definitions:
   this.knobBank1 = [74, 71, 76, 77, 93, 18, 19, 16, 17, 91];
   this.knobBank2 = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44];

   this.faderBank1 = [73, 75, 79, 72, 80, 81, 82, 83, 85];
   this.faderBank2 = [67, 68, 69, 70, 87, 88, 89, 90, 92];
   // Normal Button Press:
   this.buttonBank = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
   // Long Press on the Button:
   this.buttonBankL = [104, 105, 106, 107, 108, 109, 110, 111, 116, 117];
   // Bank 1 + 2:
   this.bank1 = 47;
   this.bank2 = 46;
   this.bankToggle = false;
   // Sound, Multi Buttons:
   this.sound = 118;
   this.multi = 119;
   // Sound/Multi Toggle:
   this.soundMulti = false;
   // Main Page Variable:
   this.controllerPage = 0;
   // Selected Button:
   this.pageSelect = 0;
   // Param + Value Encoders:
   this.param = 112;
   this.paramClick = 113;
   this.paramIsClicked = false;
   this.value = 114;
   this.valueClick = 115;
   this.valueIsClicked = false;
   // Volume:
   this.volume = 7;
   // Pads:
   this.lowestPad = 36;

   // Transport:
   this.loopToggle = 55;

   // Observer Values:
   this.masterVolume = 0;
   this.trackVolume = [];
   this.deviceMacro = [];
   this.deviceMapping = [];
   this.pageNames = [];
   this.buttonToggle = [];

   // "HasChanged" & Accumulators
   this.masterVolumeHasChanged = false;
   this.deviceHasChanged = false;
   this.pPageHasChanged = false;
   this.presetHasChanged = false;
   this.presetCategoryHasChanged = false;
   this.presetCreatorHasChanged = false;
   this.trackHasChanged = false;
   this.trackVolumeHasChanged = false;
   this.positionHasChanged = false;
   this.punchInHasChanged = false;
   this.punchOutHasChanged = false;
   this.playHasChanged = false;
   this.recordHasChanged = false;
   this.loopHasChanged = false;
   this.panHasChanged = false;
   this.send1HasChanged = false;
   this.send2HasChanged = false;
   this.send3HasChanged = false;
   this.speedHasChanged = false;
   this.macroHasChanged = [];
   this.commonHasChanged = [];
   this.envelopeHasChanged = [];
   this.parameterHasChanged = [];
   this.tracksVolumesHaveChanged = [];

   this.userNotifications = true;

   this.trackAccumulator = 0;
   this.trackBankAccumulator = 0;
   this.deviceAccumulator = 0;

   // Keep last value:
   this.currentPreset = "None";
   this.currentCategory = "None";
   this.currentCreator = "None";
   this.currentPan = 0;
   this.currentSend1Val = 0;
   this.currentSend2Val = 0;
   this.currentSend3Val = 0;
   this.currentSend1 = "None";
   this.currentSend2 = "None";
   this.currentSend3 = "None";
   this.currentTrack = "None";
   this.currentDevice = "None";
   this.currentTime = 0;
   this.currentInPosition = 0;
   this.currentOutPosition = 0;
   this.currentSpeed = 0;
   this.currentVolume = 0;

   this.macroName = [];
   this.macroValue = [];
   this.commonName = [];
   this.commonValue = [];
   this.envelopeName = [];
   this.envelopeValue = [];
   this.parameterName = [];
   this.parameterValue = [];
   // Initialisations:
   for(var i = 0; i < 8; i++) {
      this.trackVolume[i] = 0;
      this.deviceMacro[i] = 0;
      this.deviceMapping[i] = 0;
      this.macroName[i] = "";
      this.macroValue[i] = "";
      this.commonName[i] = "";
      this.commonValue[i] = "";
      this.envelopeName[i] = "";
      this.envelopeValue[i] = "";
      this.parameterName[i] = "";
      this.parameterValue[i] = "";
      this.buttonToggle[i] = false;
      this.macroHasChanged[i] = false;
      this.commonHasChanged[i] = false;
      this.envelopeHasChanged[i] = false;
      this.parameterHasChanged[i] = false;
      this.tracksVolumesHaveChanged[i] = false;
   }
   this.envelopeName[8] = "";
   this.envelopeValue[8] = "";
   this.buttonToggle[8] = false;
   this.buttonToggle[9] = false;

   // Pad Translation Table:
   this.padTranslation = initArray(0, 128);
   this.padOffset = 0;

   this.lowestCC = 1;
   this.highestCC = 119;

   // Creating Main Views:
   this.notifications = host.getNotificationSettings();
   this.application = host.createApplication();
   this.transport = host.createTransport();
   this.masterTrack = host.createMasterTrack(0);
   this.tracks = host.createMainTrackBank(8, 0, 0);
   this.cTrack = host.createCursorTrack(3, 0);
   this.cDevice = this.cTrack.getPrimaryDevice();
   this.uMap = host.createUserControls(8);
   this.uControls = host.createUserControlsSection(this.highestCC - this.lowestCC + 1);

   notifications.getUserNotificationsEnabled().addValueObserver(function(on) {
      this.userNotifications = on;
   });

   this.notifications.setShouldShowValueNotifications(true);
   this.notifications.setShouldShowTrackSelectionNotifications(true);
   this.notifications.setShouldShowSelectionNotifications(true);
   this.notifications.setShouldShowPresetNotifications(true);
   this.notifications.setShouldShowMappingNotifications(true);
   this.notifications.setShouldShowDeviceSelectionNotifications(true);
   this.notifications.setShouldShowDeviceLayerSelectionNotifications(true);
   this.notifications.setShouldShowChannelSelectionNotifications(true);

   for(var h = this.lowestCC; h <= this.highestCC; h++) {
      this.uControls.getControl(h - this.lowestCC).setLabel("CC" + h);
   }

   // Observers:
   this.masterTrack.getVolume().addValueDisplayObserver(16, "None", function(volume) {
      this.masterVolume = volume;
      if(this.masterVolumeHasChanged) {
         sendTextToKeyLab("Master Volume:", volume);
         this.masterVolumeHasChanged = false;
      }
   });
   this.cDevice.addPageNamesObserver(function(names) {
      this.pageNames = [];
      for(var j = 0; j < arguments.length; j++) {
         this.pageNames[j] = arguments[j];
      }
   });
   this.cDevice.addSelectedPageObserver(-1, function(on) {
      //this.pageSelect = on;
      //println(on);
   });
   this.cDevice.addNameObserver(16, "None", function(name) {
      this.currentDevice = name;
      if(this.deviceHasChanged) {
         sendTextToKeyLab("Current Device:", name);
         this.deviceHasChanged = false;
      }
   });
   this.cDevice.addPresetNameObserver(16, "None", function(name) {
      this.currentPreset = name;
      if(this.presetHasChanged) {
         sendTextToKeyLab("Current Preset:", name);
         this.presetHasChanged = false;
      }
   });
   this.cDevice.addPresetCategoryObserver(16, "None", function(name) {
      this.currentCategory = name;
      if(this.presetCategoryHasChanged) {
         sendTextToKeyLab("Preset Category:", name);
         this.presetCategoryHasChanged = false;
      }
   });
   this.cDevice.addPresetCreatorObserver(16, "None", function(name) {
      this.currentCreator = name;
      if(this.presetCreatorHasChanged) {
         sendTextToKeyLab("Preset Creator:", name);
         this.presetCreatorHasChanged = false;
      }
   });

   this.transport.addIsLoopActiveObserver(function(on) {
      var lop = on ? "01" : "00";
      if(this.loopHasChanged) {
         this.loopHasChanged = false;
         if(on) {
            sendTextToKeyLab("Transport:", "Loop Enabled");
            sendSysex("F0 00 20 6B 7F 42 02 00 10 5D 01 F7");
         }
         else {
            sendTextToKeyLab("Transport:", "Loop Disabled");
            host.scheduleTask(sendDelayedSysex, ["F0 00 20 6B 7F 42 02 00 10 5D 00 F7"], 300);
         }
      }
      else {
         sendSysex("F0 00 20 6B 7F 42 02 00 10 5D " + lop + " F7");
      }
   });
   this.transport.addIsPlayingObserver(function(on) {
      var play = on ? "01" : "00";
      var stp = on ? "00" : "01";
      this.isPlaying = on;
      if(this.playHasChanged) {
         if(on) {
            sendTextToKeyLab("Transport:", "Play");
            sendSysex("F0 00 20 6B 7F 42 02 00 10 5B " + play + " F7");
         }
         else {
            sendTextToKeyLab("Transport:", "Pause");
            sendSysex("F0 00 20 6B 7F 42 02 00 10 5B 00 F7");
            host.scheduleTask(sendDelayedSysex, ["F0 00 20 6B 7F 42 02 00 10 5B 00 F7"], 300);
         }
      }
      else {
         sendSysex("F0 00 20 6B 7F 42 02 00 10 5B " + play + " F7");
      }
      sendSysex("F0 00 20 6B 7F 42 02 00 10 5A " + stp + " F7");
   });
   this.transport.addIsRecordingObserver(function(on) {
      var rec = on ? "01" : "00";
      if(this.recordHasChanged) {
         if(on) {
            sendTextToKeyLab("Transport:", "Record Enabled");
            sendSysex("F0 00 20 6B 7F 42 02 00 10 5C " + rec + " F7");
         }
         else {
            sendSysex("F0 00 20 6B 7F 42 02 00 10 5C " + rec + " F7");
            sendTextToKeyLab("Transport:", "Record Disabled");
            host.scheduleTask(sendDelayedSysex, ["F0 00 20 6B 7F 42 02 00 10 5C 00 F7"], 300);
         }
      }
      else {
         sendSysex("F0 00 20 6B 7F 42 02 00 10 5C " + rec + " F7");
      }
   });
   this.transport.getPosition().addTimeObserver(":", 4, 1, 1, 2, function(time) {
      this.currentTime = time;
      if(!this.isPlaying && this.positionHasChanged) {
         sendTextToKeyLab("Current Time:", time);
         if (this.userNotifications) {
            host.showPopupNotification("Current Time: " + time);
         }
         this.positionHasChanged = false;
      }
   });
   this.transport.getInPosition().addTimeObserver(":", 4, 1, 1, 2, function(time) {
      this.currentInPosition = time;
      if(!this.isPlaying && this.punchInHasChanged) {
         sendTextToKeyLab("Loop Start:", time);
         if (this.userNotifications) {
            host.showPopupNotification("Loop Start: " + time);
         }
         this.punchInHasChanged = false;
      }
   });
   this.transport.getOutPosition().addTimeObserver(":", 4, 1, 1, 2, function(time) {
      this.currentOutPosition = time;
      if(!this.isPlaying && this.punchOutHasChanged) {
         sendTextToKeyLab("Loop End:", time);
         if (this.userNotifications) {
            host.showPopupNotification("Loop End: " + time);
         }
         this.punchOutHasChanged = false;
      }
   });
   this.transport.getTempo().addValueDisplayObserver(16, "None", function(value) {
      this.currentSpeed = value;
      if(this.speedHasChanged) {
         this.speedHasChanged = false;
         sendTextToKeyLab("Song Tempo:", value);
      }
   })
   this.cTrack.addNameObserver(16, "None", function(name) {
      this.currentTrack = name;
      if(this.trackHasChanged) {
         this.trackHasChanged = false;
         sendTextToKeyLab("Current Track:", name);
      }
   });
   this.cTrack.getVolume().addValueDisplayObserver(16, "None", function(value) {
      this.currentVolume = value;
      if(this.trackVolumeHasChanged) {
         this.trackVolumeHasChanged = false;
         sendTextToKeyLab("Track Volume:", value);
      }
   })
   this.cTrack.getPan().addValueDisplayObserver(16, "None", function(value) {
      this.currentPan = value;
      if(this.panHasChanged) {
         this.panHasChanged = false;
         sendTextToKeyLab("Track Pan:", value);
      }
   });
   this.cTrack.getSend(0).addNameObserver(16, "None", function(name) {
      this.currentSend1 = name;
   });
   this.cTrack.getSend(0).addValueDisplayObserver(16, "None", function(value) {
      this.currentSend1Val = value;
      if(this.send1HasChanged) {
         this.send1HasChanged = false;
         sendTextToKeyLab(this.currentSend1 + ":", value);
      }
   });
   this.cTrack.getSend(1).addNameObserver(16, "None", function(name) {
      this.currentSend2 = name;
   });
   this.cTrack.getSend(1).addValueDisplayObserver(16, "None", function(value) {
      this.currentSend2Val = value;
      if(this.send2HasChanged) {
         this.send2HasChanged = false;
         sendTextToKeyLab(this.currentSend2 + ":", value);
      }
   });
   this.cTrack.getSend(2).addNameObserver(16, "None", function(name) {
      this.currentSend3 = name;
   });
   this.cTrack.getSend(2).addValueDisplayObserver(16, "None", function(value) {
      this.currentSend3Val = value;
      if(this.send3HasChanged) {
         this.send3HasChanged = false;
         sendTextToKeyLab(this.currentSend3 + ":", value);
      }
   });

   // Parameter Name Observers:
   for(var j = 0; j < 8; j++) {
      // Macro Name:
      this.cDevice.getMacro(j).addLabelObserver(16, "None", getValueObserverFunc(j, this.macroName));
      // Macro Value:
      this.cDevice.getMacro(j).getAmount().addValueDisplayObserver(16, "None", getValueObserverFuncMacro(j, this.macroValue, this.macroName, this.macroHasChanged));
      // Common Parameter Name:
      this.cDevice.getCommonParameter(j).addNameObserver(16, "None", getValueObserverFunc(j, this.commonName));
      // Common Parameter Value:
      this.cDevice.getCommonParameter(j).addValueDisplayObserver(16, "None", getValueObserverFuncCommon(j, this.commonValue, getCommonName, this.commonHasChanged));
      // Envelope Parameter Name:
      this.cDevice.getEnvelopeParameter(j).addNameObserver(16, "None", getValueObserverFunc(j, this.envelopeName));
      // Envelope Parameter Value:
      this.cDevice.getEnvelopeParameter(j).addValueDisplayObserver(16, "None", getValueObserverFuncCommon(j, this.envelopeValue, getEnvelopeName, this.envelopeHasChanged));
      // Parameter Name:
      this.cDevice.getParameter(j).addNameObserver(16, "None", getValueObserverFunc(j, this.parameterName));
      // Parameter Value:
      this.cDevice.getParameter(j).addValueDisplayObserver(16, "None", getValueObserverFuncCommon(j, this.parameterValue, getParameterName, this.parameterHasChanged));
      // Track Volume:
      this.tracks.getTrack(j).getVolume().addValueDisplayObserver(16, "None", getValueObserverFuncDisplay(j, this.trackVolume, "Track Volume:", this.tracksVolumesHaveChanged));
   }
   j = 8;
   // Envelope Parameter Name:
   this.cDevice.getEnvelopeParameter(j).addNameObserver(16, "None", getValueObserverFunc(j, this.envelopeName));
   // Envelope Parameter Value:
   this.cDevice.getEnvelopeParameter(j).addValueDisplayObserver(16, "None", getValueObserverFuncCommon(j, this.envelopeValue, getEnvelopeName, this.envelopeHasChanged));

   this.cTrack.addNoteObserver(function(on, key, vel) {
      var low = this.lowestPad + (16 * this.padOffset);
      if(key >= low && key < (low + 16)) {
         on ? sendMidi(153, key, 127) : sendMidi(137, key, 0);
      }
   })

   // Return the object:
   return this;
}

// Main Init Function:
function init() {
   // Instantiate the main KeyLab Object
   kL = KeyLab();
   // Setting the device to a defined state:
   configureDeviceUsingSysex();
   // Welcome Message on Display:
   sendTextToKeyLab("ARTURIA + BITWIG", "TAKE CONTROL");
   setPage();
}

// Main Function for Midi Handling:
function onMidi(status, data1, data2) {
   // Instantiate the MidiData Object for convenience:
   var midi = new MidiData(status, data1, data2);

   // Show the Midi Output in the Scripting Console:
   //printMidi(midi.status, midi.data1, midi.data2);

   // Switch over receivced data type:
   switch(midi.type()) {
      // handle all CCs:
      case "CC":
         var increment = midi.data2 - 64;
         switch(midi.data1) {
            // Transport - Loop:
            case kL.loopToggle:
               kL.loopHasChanged = true;
               kL.transport.toggleLoop();
               break;
               // Bank 1
            case kL.bank1:
               kL.bankToggle = false;
               setPage();
               sendTextToKeyLab(MODE.label1, MODE.label2);
               break;
               // Bank 2
            case kL.bank2:
               kL.bankToggle = true;
               setPage();
               sendTextToKeyLab(MODE.label1, MODE.label2);
               break;
               // Sound Mode
            case kL.sound:
               kL.soundMulti = false;
               setPage();
               MODE.onSoundMultiPressed(true);
               sendTextToKeyLab(MODE.label1, MODE.label2);
               break;
               // Multi Mode
            case kL.multi:
               kL.soundMulti = true;
               setPage();
               MODE.onSoundMultiPressed(false);
               sendTextToKeyLab(MODE.label1, MODE.label2);
               break;
               // Preset/Category Up/Down:
            case kL.paramClick:
               kL.paramIsClicked = (midi.isOn());
               MODE.onParamCategoryClick(kL.paramIsClicked);
               break;
               // Value Knob Held Down:
            case kL.valueClick:
               kL.valueIsClicked = (midi.isOn());
               MODE.onValuePresetClick(kL.valueIsClicked);
               break;
               // Param Knob
            case kL.param:
               if(increment != 0) {
                  MODE.onParamCategory(increment);
               }
               break;
               // Value Knob
            case kL.value:
               if(increment != 0) {
                  MODE.onValuePreset(increment);
               }
               break;
               // Volume Knob:
            case kL.volume:
               MODE.onVolumeEncoder(increment);
               break;

               // Knobs:
            case kL.knobBank1[0]:
            case kL.knobBank2[0]:
               MODE.onEncoder(0, increment);
               break;
            case kL.knobBank1[1]:
            case kL.knobBank2[1]:
               MODE.onEncoder(1, increment);
               break;
            case kL.knobBank1[2]:
            case kL.knobBank2[2]:
               MODE.onEncoder(2, increment);
               break;
            case kL.knobBank1[3]:
            case kL.knobBank2[3]:
               MODE.onEncoder(3, increment);
               break;
            case kL.knobBank1[4]:
            case kL.knobBank2[4]:
               MODE.onEncoder(4, increment);
               break;
            case kL.knobBank1[5]:
            case kL.knobBank2[5]:
               MODE.onEncoder(5, increment);
               break;
            case kL.knobBank1[6]:
            case kL.knobBank2[6]:
               MODE.onEncoder(6, increment);
               break;
            case kL.knobBank1[7]:
            case kL.knobBank2[7]:
               MODE.onEncoder(7, increment);
               break;
            case kL.knobBank1[8]:
            case kL.knobBank2[8]:
               MODE.onEncoder(8, increment);
               break;
            case kL.knobBank1[9]:
            case kL.knobBank2[9]:
               MODE.onEncoder(9, increment);
               break;

               // Faders:
            case kL.faderBank1[0]:
            case kL.faderBank2[0]:
               MODE.onFader(0, midi.data2);
               break;
            case kL.faderBank1[1]:
            case kL.faderBank2[1]:
               MODE.onFader(1, midi.data2);
               break;
            case kL.faderBank1[2]:
            case kL.faderBank2[2]:
               MODE.onFader(2, midi.data2);
               break;
            case kL.faderBank1[3]:
            case kL.faderBank2[3]:
               MODE.onFader(3, midi.data2);
               break;
            case kL.faderBank1[4]:
            case kL.faderBank2[4]:
               MODE.onFader(4, midi.data2);
               break;
            case kL.faderBank1[5]:
            case kL.faderBank2[5]:
               MODE.onFader(5, midi.data2);
               break;
            case kL.faderBank1[6]:
            case kL.faderBank2[6]:
               MODE.onFader(6, midi.data2);
               break;
            case kL.faderBank1[7]:
            case kL.faderBank2[7]:
               MODE.onFader(7, midi.data2);
               break;
            case kL.faderBank1[8]:
            case kL.faderBank2[8]:
               MODE.onFader(8, midi.data2);
               break;

               // Buttons:
            case kL.buttonBank[0]:
               MODE.onButtonPress(0, midi.isOn());
               break;
            case kL.buttonBank[1]:
               MODE.onButtonPress(1, midi.isOn());
               break;
            case kL.buttonBank[2]:
               MODE.onButtonPress(2, midi.isOn());
               break;
            case kL.buttonBank[3]:
               MODE.onButtonPress(3, midi.isOn());
               break;
            case kL.buttonBank[4]:
               MODE.onButtonPress(4, midi.isOn());
               break;
            case kL.buttonBank[5]:
               MODE.onButtonPress(5, midi.isOn());
               break;
            case kL.buttonBank[6]:
               MODE.onButtonPress(6, midi.isOn());
               break;
            case kL.buttonBank[7]:
               MODE.onButtonPress(7, midi.isOn());
               break;
            case kL.buttonBank[8]:
               MODE.onButtonPress(8, midi.isOn());
               break;
            case kL.buttonBank[9]:
               MODE.onButtonPress(9, midi.isOn());
               break;
         }
         break;
         //case "NoteOn":
         //	 break;
         //case "NoteOff":
         //	 break;
         //case "KeyPressure":
         //	 break;
         //case "ProgramChange":
         //	 break;
         //case "ChannelPressure":
         //	 break;
         //case "PitchBend":
         //	 break;
         //case "Other":
         //	 break
   }
}

function onSysex(data) {
   //printSysex(data);
   // MMC Transport Controls:
   switch(data) {
      case "f07f7f0605f7":
         kL.transport.rewind();
         sendTextToKeyLab("Transport:", "Rewind");
         break;
      case "f07f7f0604f7":
         kL.transport.fastForward();
         sendTextToKeyLab("Transport:", "Fast Forward");
         break;
      case "f07f7f0601f7":
         kL.transport.stop();
         sendTextToKeyLab("Transport:", "Stop");
         break;
      case "f07f7f0602f7":
         kL.playHasChanged = true;
         kL.transport.play();
         break;
      case "f07f7f0606f7":
         kL.recordHasChanged = true;
         kL.transport.record();
         break;
   }
}

// Set the current page:
function setPage() {
   var previousMode = MODE;
   if(kL.bankToggle) {
      MODE = ARTURIA_MODE;
   }
   else {
      if(kL.soundMulti) {
         MODE = MULTI_MODE;
      }
      else {
         MODE = SOUND_MODE;
      }
   }

   if(previousMode != MODE) {
      switch(MODE) {
         case SOUND_MODE:
            setDeviceIndication(true);
            setTrackIndication(false);
            setButtonLight(kL.pageSelect);
            kL.cTrack.getVolume().setIndication(true);
            break;
         case MULTI_MODE:
            setDeviceIndication(false);
            setTrackIndication(true);
            setButtonLight(-1);
            kL.cTrack.getVolume().setIndication(true);
            break;
         case ARTURIA_MODE:
            setDeviceIndication(false);
            setTrackIndication(false);
            setButtonLight(-1);
            kL.cTrack.getVolume().setIndication(false);
            break;
      }

      if(previousMode != null) {
         host.showPopupNotification(MODE.label1 + MODE.label2);
      }
   }
}

// Set Device Value based on current page:
function setDeviceValue(index, page, increment) {
   switch(page) {
      case 0:
         kL.macroHasChanged[index] = true;
         kL.cDevice.getMacro(index).getAmount().inc(increment, 128);
         sendTextToKeyLab(getMacroName(index), kL.macroValue[index]);
         break;
      case 1:
         var com1;
         var com2;
         kL.commonHasChanged[index] = true;
         kL.cDevice.getCommonParameter(index).inc(increment, 128);
         [com1, com2] = getCommonName(index);
         sendTextToKeyLab(com1, com2);
         break;
      default:
         var def1;
         var def2;
         kL.parameterHasChanged[index] = true;
         kL.cDevice.getParameter(index).inc(increment, 128);
         [def1, def2] = getParameterName(index);
         sendTextToKeyLab(def1, def2);
         break;
   }
}

function getMacroName (index) {
   if(kL.macroName[index]) {
      return (kL.macroName[index] + ":");
   }
   else {
      return ("Macro " + (index + 1) + ":");
   }
}

function getCommonName (index) {
   if(kL.commonName[index] === "None") {
      return ["Unassigned", ""];
   }
   else {
      return [kL.commonName[index] + ":", kL.commonValue[index]];
   }
}

function getEnvelopeName (index) {
   if(kL.envelopeName[index] === "None") {
      return ["Unassigned", ""];
   }
   else {
      return [kL.envelopeName[index] + ":", kL.envelopeValue[index]];
   }
}

function getParameterName (index) {
   if(kL.pageNames[kL.pageSelect - 2] && kL.commonName[index] !== "None") {
      return [kL.parameterName[index] + ":", kL.parameterValue[index]];
   }
   else {
      return ["Unassigned", ""];
   }
}

// Set up the Buttons for Parameter Page Selection:
function setParameterButtons(isOn, index) {
   if(isOn) {
      //println(index);
      kL.pageSelect = index;
      try {
         kL.pPageHasChanged = true;
         kL.cDevice.setParameterPage(index - 2);
      }
      catch(e) {}
      setDeviceIndication(true);
   }
   else {
      setButtonLight(index);
      kL.pPageHasChanged = true;
      if(kL.pageNames[kL.pageSelect - 2]) {
         if (kL.userNotifications) {
            host.showPopupNotification("Parameter Page: " + kL.pageNames[kL.pageSelect - 2]);
         }
         sendTextToKeyLab("Parameter Page:", kL.pageNames[kL.pageSelect - 2])
      }
      else {
         if (kL.userNotifications) {
            host.showPopupNotification("Parameter Page: Unassigned");
         }
         sendTextToKeyLab("Parameter Page:", "Unassigned")
      }
   }
}

// Set the Colour Indication on Devices:
function setDeviceIndication(enabled) {
   if(enabled) {
      switch(kL.pageSelect) {
         case 0:
            var macro = true;
            var common = false;
            //         var envelope = true;
            var user = false;
            break;
         case 1:
            var macro = false;
            var common = true;
            //         var envelope = true;
            var user = false;
            break;
         default:
            var macro = false;
            var common = false;
            //         var envelope = true;
            var user = true;
            break;
      }
   }
   else {
      var macro = false;
      var common = false;
      //      var envelope = false;
      var user = false;
   }
   for(var i = 0; i < 8; i++) {
      kL.cDevice.getMacro(i).getAmount().setIndication(macro);
      //kL.cDevice.getEnvelopeParameter(i).setIndication(envelope);
      kL.cDevice.getCommonParameter(i).setIndication(common);
      kL.cDevice.getParameter(i).setIndication(user);
   }
   //kL.cDevice.getEnvelopeParameter(8).setIndication(envelope);
}

// Set the Colour Indication on Tracks, Pan and Sends
function setTrackIndication(enabled) {
   for(var i = 0; i < 8; i++) {
      kL.tracks.getTrack(i).getVolume().setIndication(enabled);
   }
   kL.cTrack.getVolume().setIndication(enabled);
   // Pan
   kL.cTrack.getPan().setIndication(enabled);
   // Sends
   kL.cTrack.getSend(0).setIndication(enabled);
   kL.cTrack.getSend(1).setIndication(enabled);
   kL.cTrack.getSend(2).setIndication(enabled);
   // Master Track:
   kL.masterTrack.getVolume().setIndication(enabled);
}

// Make the Lights on the Buttons exclusive
function setButtonLight(index) {
   for(var i = 0; i < 10; i++) {
      var on = (index === i) ? " 01" : " 00";
      sendSysex("F0 00 20 6B 7F 42 02 00 00 " + kL.sysexIDbuttonBank[i] + on + " F7");
   }
}

// Send Text to KeyLab Display:
function sendTextToKeyLab(line1, line2) {
   sendSysex("F0 00 20 6B 7F 42 04 00 60 01 " + line1.toHex(16) + " 00 02 " + line2.toHex(16) + " 00 F7");
}

function sendDelayedSysex(SysEx) {
   sendSysex(SysEx);
}

// A function to create an indexed function for the Observers
function getValueObserverFunc(index, varToStore) {
   return function(value) {
      varToStore[index] = value;
   }
}

// A function to create an indexed function for the Observers
function getValueObserverFuncDisplay(index, varToStore, name, varToTest) {
   return function(value) {
      varToStore[index] = value;
      if (varToTest[index]) {
         varToTest[index] = false;
         sendTextToKeyLab(name, value);
      }
   }
}

// A function to create an indexed function for the Macro Observers
function getValueObserverFuncMacro(index, varToStore, name, varToTest) {
   return function(value) {
      varToStore[index] = value;
      if (varToTest[index]) {
         varToTest[index] = false;
         sendTextToKeyLab(getMacroName(index), value);
      }
   }
}

// A function to create an indexed function for the Common Parameter Observers
function getValueObserverFuncCommon(index, varToStore, name, varToTest) {
   return function(value) {
      varToStore[index] = value;
      if (varToTest[index]) {
         var temp1;
         var temp2;
         varToTest[index] = false;
         [temp1, temp2] = name(index);
         if (temp2 === "") {
            sendTextToKeyLab(temp1, temp2);
         }
         else {
            sendTextToKeyLab(temp1, value);
         }
      }
   }
}

// Exit Function
function exit() {
   // Reset Working Memory to a default state:
   resetKeyLabToAbsoluteMode();
}
