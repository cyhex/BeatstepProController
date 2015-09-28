// Controller Script for the Arturia KeyLab 25

loadAPI(1);

load ("Extensions.js");
load ("KeyLab.js");

DRUMPADS = false;
CNAME = "KeyLab 25";

host.defineController("Arturia", "KeyLab 25", "1.0", "360d96b0-0210-11e4-9191-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["KeyLab 25"], ["KeyLab 25"]);
host.defineSysexIdentityReply("F0 7E 00 06 02 00 20 6B ?? ?? 05 00 ?? ?? ?? ?? F7");
