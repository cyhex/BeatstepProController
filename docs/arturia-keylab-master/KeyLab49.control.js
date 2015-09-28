// Controller Script for the Arturia KeyLab 49

loadAPI(1);

//load ("Extensions.js");
load ("KeyLab.js");

DRUMPADS = true;
CNAME = "KeyLab 49";

host.defineController("Arturia", "KeyLab 49", "1.0", "faa89c00-020a-11e4-9191-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["KeyLab 49"], ["KeyLab 49"]);
host.defineSysexIdentityReply("F0 7E 00 06 02 00 20 6B ?? ?? 05 02 ?? ?? ?? ?? F7");
