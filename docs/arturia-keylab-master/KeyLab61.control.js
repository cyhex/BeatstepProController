// Controller Script for the Arturia KeyLab 61

loadAPI(1);

load ("Extensions.js");
load ("KeyLab.js");

DRUMPADS = true;
CNAME = "KeyLab 61";

host.defineController("Arturia", "KeyLab 61", "1.0", "2d1a0610-0210-11e4-9191-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["KeyLab 61"], ["KeyLab 61"]);
host.defineSysexIdentityReply("F0 7E 00 06 02 00 20 6B ?? ?? 05 04 ?? ?? ?? ?? F7");
