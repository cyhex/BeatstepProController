// Main Mode Function:
function Mode(label1, label2) {
   this.label1 = label1;
   this.label2 = label2;
}

Mode.prototype.onParamCategory = function(inc) {
   if(kL.paramIsClicked) {
      kL.presetCreatorHasChanged = true;
      if(inc > 0) {
         kL.cDevice.switchToNextPresetCreator();
      }
      else if(inc < 0) {
         kL.cDevice.switchToPreviousPresetCreator();
      }
      sendTextToKeyLab("Preset Creator:", kL.currentCategory);
   }
   else {
      kL.presetCategoryHasChanged = true;
      if(inc > 0) {
         kL.cDevice.switchToNextPresetCategory();
      }
      else {
         kL.cDevice.switchToPreviousPresetCategory();
      }
      sendTextToKeyLab("Preset Category:", kL.currentCategory);
   }
};

Mode.prototype.onParamCategoryClick = function(pressed) {};

Mode.prototype.onValuePreset = function(inc) {
   kL.presetHasChanged = true;
   if(inc > 0) {
      kL.cDevice.switchToNextPreset();
   }
   else {
      kL.cDevice.switchToPreviousPreset();
   }
   sendTextToKeyLab("Current Preset:", kL.currentPreset);
};

Mode.prototype.onValuePresetClick = function(pressed) {};

Mode.prototype.onVolumeEncoder = function(inc) {
   kL.trackVolumeHasChanged = true;
   kL.cTrack.getVolume().inc(inc, 128);
   sendTextToKeyLab("Track Volume:", kL.currentVolume);
};

Mode.prototype.onSoundMultiPressed = function(soundOn) {};

// Arturia Mode:
var ARTURIA_MODE = new Mode("Arturia Mode ", "(CC)");
ARTURIA_MODE.encoderValues = initArray(64, 10);
ARTURIA_MODE.volumeValue = 64;

ARTURIA_MODE.onEncoder = function(index, inc) {
   var oldVal = this.encoderValues[index];
   var val = Math.max(0, Math.min(127, oldVal + inc));

   if(val != oldVal) {
      this.encoderValues[index] = val;
      kL.midiInKeys.sendRawMidiEvent(0xB0, kL.knobBank1[index], val);
   }
   kL.uControls.getControl(kL.knobBank1[index]).inc(inc, 128);
};

ARTURIA_MODE.onVolumeEncoder = function(inc) {
   var oldVal = this.volumeValue;
   var val = Math.max(0, Math.min(127, oldVal + inc));

   if(val != oldVal) {
      this.volumeValue = val;
      kL.midiInKeys.sendRawMidiEvent(0xB0, kL.volume, val);
   }
   kL.uControls.getControl(kL.volume).inc(inc, 128);
};

ARTURIA_MODE.onFader = function(index, value) {
   kL.midiInKeys.sendRawMidiEvent(0xB0, kL.faderBank1[index], value);
   kL.uControls.getControl(kL.faderBank1[index]).set(value, 128);
};

ARTURIA_MODE.onParamCategory = function(inc) {
   kL.midiInKeys.sendRawMidiEvent(0xB0, kL.param, 64 + inc);
   kL.uControls.getControl(kL.param).inc(inc, 128);
};

ARTURIA_MODE.onParamCategoryClick = function(pressed) {
   kL.midiInKeys.sendRawMidiEvent(0xB0, kL.paramClick, pressed ? 127 : 0);
   kL.uControls.getControl(kL.paramClick).set(pressed ? 127 : 0, 128);
};

ARTURIA_MODE.onValuePreset = function(inc) {
   kL.midiInKeys.sendRawMidiEvent(0xB0, kL.value, 64 + inc);
   kL.uControls.getControl(kL.value).inc(inc, 128);
};

ARTURIA_MODE.onValuePresetClick = function(pressed) {
   kL.midiInKeys.sendRawMidiEvent(0xB0, kL.valueClick, pressed ? 127 : 0);
   kL.uControls.getControl(kL.valueClick).set(pressed ? 127 : 0, 128);
};

ARTURIA_MODE.onButtonPress = function(index, pressed) {
   if(pressed) {
      kL.buttonToggle[index] = !kL.buttonToggle[index];
   }
   kL.midiInKeys.sendRawMidiEvent(0xB0, kL.buttonBank[index], pressed ? 127 : 0);
   kL.uControls.getControl(kL.buttonBank[index]).set(kL.buttonToggle[index] ? 127 : 0, 128);
};

ARTURIA_MODE.onSoundMultiPressed = function(soundOn) {
   kL.midiInKeys.sendRawMidiEvent(0xB0, (soundOn ? kL.sound : kL.multi), 127);
}

// Sound Mode:
var SOUND_MODE = new Mode("Bitwig: ", "Sound Mode");

SOUND_MODE.onEncoder = function(index, inc) {
   if(index < 4) {
      // 0 - 3
      setDeviceValue(index, kL.pageSelect, inc);
   }
   else if(index === 4) {
      kL.trackAccumulator += Math.abs(inc);
      if(kL.trackAccumulator > 4) {
         kL.trackAccumulator = 0;
         kL.trackHasChanged = true;
         inc < 0 ? kL.cTrack.selectPrevious() : kL.cTrack.selectNext();
      }
      sendTextToKeyLab("Current Track:", kL.currentTrack);
   }
   else if(index === 9) {
      kL.deviceAccumulator += Math.abs(inc);
      if(kL.deviceAccumulator > 4) {
         kL.deviceAccumulator = 0;
         kL.deviceHasChanged = true;
         kL.cDevice.switchToDevice(DeviceType.ANY, inc < 0 ? ChainLocation.PREVIOUS : ChainLocation.NEXT);
      }
      sendTextToKeyLab("Current Device:", kL.currentDevice);
   }
   else {
      // 5 - 8
      setDeviceValue(index - 1, kL.pageSelect, inc);
   }
};

SOUND_MODE.onFader = function(index, value) {
   var env1;
   var env2;
   kL.envelopeHasChanged[index] = true;
   kL.cDevice.getEnvelopeParameter(index).set(value, 128);
   [env1, env2] = getEnvelopeName(index);
   sendTextToKeyLab(env1, env2);
};

SOUND_MODE.onButtonPress = function(index, pressed) {
   if(index === 0) {
      // Macros:
      pressed ? kL.pageSelect = 0 : setButtonLight(0);
      setDeviceIndication(true);
      if (kL.userNotifications) {
         host.showPopupNotification("Active Controls: Device Macros");
      }
      sendTextToKeyLab("Active Controls:", "Device Macros")
   }
   else if(index === 1) {
      // Common:
      pressed ? kL.pageSelect = 1 : setButtonLight(1);
      setDeviceIndication(true);
      if (kL.userNotifications) {
         host.showPopupNotification("Parameter Page: Common");
      }
      sendTextToKeyLab("Parameter Page:", "Common")
   }
   else {
      setParameterButtons(pressed, index);
   }
};

// Multi/Mix Mode:
var MULTI_MODE = new Mode("Bitwig: ", "Mix Mode");

MULTI_MODE.onEncoder = function(index, increment) {
   switch(index) {
      case 0:
         kL.panHasChanged = true;
         kL.cTrack.getPan().inc(increment, 127);
         sendTextToKeyLab("Pan:", kL.currentPan);
         break;
      case 1:
         kL.send1HasChanged = true;
         kL.cTrack.getSend(0).inc(increment, 128);
         sendTextToKeyLab(kL.currentSend1 + ":", kL.currentSend1Val);
         break;
      case 2:
         kL.send2HasChanged = true;
         kL.cTrack.getSend(1).inc(increment, 128);
         sendTextToKeyLab(kL.currentSend2 + ":", kL.currentSend2Val);
         break;
      case 3:
         kL.send3HasChanged = true;
         kL.cTrack.getSend(2).inc(increment, 128);
         sendTextToKeyLab(kL.currentSend3 + ":", kL.currentSend3Val);
         break;
      case 5:
         kL.positionHasChanged = true;
         kL.transport.incPosition(increment, true);
         sendTextToKeyLab("Current Time:", kL.currentTime);
         break;
      case 6:
         kL.punchInHasChanged = true;
         kL.punchOutHasChanged = false;
         kL.transport.getInPosition().incRaw(increment);
         sendTextToKeyLab("Punch-In Time:", kL.currentInPosition);
         break;
      case 7:
         kL.punchOutHasChanged = true;
         kL.transport.getOutPosition().incRaw(increment);
         sendTextToKeyLab("Punch-Out Time:", kL.currentOutPosition);
         break;
      case 8:
         kL.transport.increaseTempo(increment, 647);
         kL.speedHasChanged = true;
         sendTextToKeyLab("Song Tempo:", kL.currentSpeed);
         break;

      case 4:
         // Move the Cursor Track:
         kL.trackAccumulator += Math.abs(increment);
         if(kL.trackAccumulator > 4) {
            kL.trackAccumulator = 0;
            kL.trackHasChanged = true;
            increment < 0 ? kL.cTrack.selectPrevious() : kL.cTrack.selectNext();
         }
         sendTextToKeyLab("Current Track:", kL.currentTrack);
         break;

      case 9:
         // Move the Track Bank:
         var scrollDirection = (increment < 0 ? "Up" : "Down");
         kL.trackBankAccumulator += Math.abs(increment);
         if(kL.trackBankAccumulator > 4) {
            kL.trackBankAccumulator = 0;
            increment < 0 ? kL.tracks.scrollTracksUp() : kL.tracks.scrollTracksDown();
         }
         sendTextToKeyLab("Scroll Tracks:", scrollDirection);
         break;
   }
};

MULTI_MODE.onFader = function(index, value) {
   if(index === 8) {
      kL.masterVolumeHasChanged = true;
      kL.masterTrack.getVolume().set(value, 128);
      sendTextToKeyLab("Master Volume:", kL.masterVolume);
   }
   else {
      sendTextToKeyLab("Track Volume:", kL.trackVolume[index]);
      kL.tracksVolumesHaveChanged[index] = true;
      kL.tracks.getTrack(index).getVolume().set(value, 128);
   }
};

MULTI_MODE.onButtonPress = function(index, pressed) {
   switch(index) {
      case 0:
         if(pressed) {
            kL.application.toggleInspector();
         }
         sendTextToKeyLab("Toggle Inspector", "");
         break;
      case 1:
         if(pressed) {
            kL.application.toggleNoteEditor();
         }
         sendTextToKeyLab("Note Editor", "");
         break;
      case 2:
         if(pressed) {
            kL.application.toggleAutomationEditor();
         }
         sendTextToKeyLab("Automation", "Editor");
         break;
      case 3:
         if(pressed) {
            kL.application.toggleDevices();
         }
         sendTextToKeyLab("Device Chain", "");
         break;
      case 4:
         if(pressed) {
            kL.application.toggleMixer();
         }
         sendTextToKeyLab("Mixer", "");
         break;
      case 5:
         if(pressed) {
            kL.application.toggleBrowserVisibility();
            sendTextToKeyLab("Toggle Browser", "");
         }
         break;
      case 6:
         if(pressed) {
            kL.application.nextPerspective();
            sendTextToKeyLab("Switch ", "Perspective");
         }
         break;
      case 7:
         if(pressed) {
            kL.application.nextProject();
            sendTextToKeyLab("Switch to next", "Project");
         }
         break;
      case 8:
         if(DRUMPADS) {
            if(kL.padOffset > -3 && pressed) {
               kL.padOffset -= 1;
               if(kL.padOffset >= 0) {
                  var prefix = " +";
               }
               else {
                  var prefix = " "
               }
               setNoteTable(kL.midiInPads, kL.padTranslation, kL.padOffset * 16);
               host.showPopupNotification("Drum Pad Bank:" + prefix + kL.padOffset);
               sendTextToKeyLab("Drum Pad Bank:", prefix + kL.padOffset)
            }
         }
         break;
      case 9:
         if(DRUMPADS) {
            if(kL.padOffset < 4 && pressed) {
               kL.padOffset += 1;
               if(kL.padOffset >= 0) {
                  var prefix = " +";
               }
               else {
                  var prefix = " "
               }
               setNoteTable(kL.midiInPads, kL.padTranslation, kL.padOffset * 16);
               host.showPopupNotification("Drum Pad Bank:" + prefix + kL.padOffset);
               sendTextToKeyLab("Drum Pad Bank:", prefix + kL.padOffset)
            }
         }
   }
};
