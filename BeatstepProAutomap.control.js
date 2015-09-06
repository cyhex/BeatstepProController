loadAPI(1);

host.defineController("Arturia", "BSP", "0.1", "06a582ac-533b-11e5-bc13-206a8ae018ce");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Arturia BeatStep Pro"], ["Arturia BeatStep Pro"]);

var LOWEST_CC = 1;
var HIGHEST_CC = 119;
var CC_CENTER_VAL = 64;

// automap set 1 & set 3
var AUTO_MAP = [10, 74, 71, 76, 114, 18, 19, 16];

var CHANNELS = {
    0: 'ALL',
    1: 'S1',
    2: 'S2',
    3: 'USR',
    10: 'DRUM'
};

DEFINED_CC = {
    // transport
    176: {
        STOP: 51,
        PLAY: 54,
        RECORD: 50
    },
    // user CC
    178: {
        PROG_PRIV: 54,
        PROG_NEXT: 55
    }
};

var CC_RESOLUTION = 128;
var inPort;
var outPort;
var transport;
var primaryInstrument;

function init() {
    transport = host.createTransport();
    inPort = host.getMidiInPort(0);
    inPort.setMidiCallback(onMidi);
    outPort = host.getMidiOutPort(0);
    // Enable Midi Beat Clock
    outPort.setShouldSendMidiBeatClock(true);

    for (var channel in CHANNELS) {
        createNoteInput(channel, CHANNELS[channel]);
    }

    cursorDevice = host.createCursorDeviceSection(8);
    cursorTrack = host.createCursorTrackSection(3, 0);
    primaryInstrument = cursorTrack.getPrimaryInstrument();

    for (var i = 0; i < 8; i++) {
        var p = primaryInstrument.getMacro(i).getAmount();
        p.setIndication(true);
    }

    // Make the rest freely mappable
    userControls = host.createUserControlsSection(HIGHEST_CC - LOWEST_CC + 1);
    for (var i = LOWEST_CC; i <= HIGHEST_CC; i++) {
        userControls.getControl(i - LOWEST_CC).setLabel("CC" + i);
    }

}


function createNoteInput(channel, inputName) {
    var channelMaskReplacement = (!channel) ? '?' : (channel - 1).toString(16),
        noteOnMask = '9x????'.replace('x', channelMaskReplacement),
        noteOffMask = '8x????'.replace('x', channelMaskReplacement),
        noteAftertouchMask = 'Ax????'.replace('x', channelMaskReplacement),
        ccMask = 'Bx????'.replace('x', channelMaskReplacement),
        programChangeMask = 'Cx????'.replace('x', channelMaskReplacement),
        noteInput = inPort.createNoteInput(inputName, noteOnMask, noteOffMask, noteAftertouchMask, ccMask, programChangeMask);

    noteInput.setShouldConsumeEvents(false);
}


function onMidi(status, cc, value) {

    println(status + " : " + cc + " : " + value);

    if (isChannelController(status)) {

        if (AUTO_MAP.indexOf(cc) != -1) {
            // automapper
            var index = AUTO_MAP.indexOf(cc);
            primaryInstrument.getMacro(index).getAmount().inc(value - CC_CENTER_VAL, CC_RESOLUTION);
        }

        if (status in DEFINED_CC) {
            if (DEFINED_CC[status].PLAY == cc && value == 127) {
                transport.play();
            } else if (DEFINED_CC[status].STOP == cc && value == 127) {
                transport.stop();
            } else if (DEFINED_CC[status].RECORD == cc && value == 127) {
                //transport.record();

            } else if (DEFINED_CC[status].PROG_NEXT == cc && value == 127) {

                primaryInstrument.switchToNextPreset();

            } else if (DEFINED_CC[status].PROG_PRIV == cc && value == 127) {

                primaryInstrument.switchToPreviousPreset();

            } else if (cc >= LOWEST_CC && cc <= HIGHEST_CC) {
                // user CC
                var ii = cc - LOWEST_CC;
                userControls.getControl(ii).inc(value - CC_CENTER_VAL, CC_RESOLUTION);
            }
        }
    }
}


