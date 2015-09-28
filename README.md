# Arturia Beatstep Pro Controller Script for Bitwig
Bitwig controller Script for Arturia Beatstep Pro

Features:
---------

**Control Mode:**

* Support for relative control changes 
* Automaping (Macro) of rotaries (1-4, 9-12) to Device Macro 1-8
* Automaping (Parameters) of rotaries (5-8, 13-16) to Device Params 1-8 (paging with step buttons 5 and 6)
* Step button 15 and 16 : Previous / next preset of active device   
* Step button 1 and 2: Previous / next Track
* Step button 3 and 4: Previous / next Device
* Step button 5 and 6: Previous / next Param Page

**Global**

* Transport buttons start / stop Bitwig 


Whats new:
----------
* Track selection
* Device selection


How to install:
---------------

1.  Download this project as a ZIP file (button on the right) and extract it to your Bitwig controller scripts folder:
    *   **Windows:** ~Documents\Bitwig Studio\Controller Scripts
    *   **Linux/Mac:** ~Documents/Bitwig Studio/Controller Scripts
2.  Open the preferences dialog in Bitwig and go to Controllers
3.  Either click "Detect available controllers" which should automatically add the BSP version with 5 inputs: S1, S2, USR, DRUM and ALL).
    * S1 - Step Seq 1
    * S1 - Step Seq 2
    * USR - Controller Mode
    * DRUM - Drum Step Seq

**Important**

* Make sure you have the latest Firmware (1.1.6) 
* Make sure you upload Template.beasteppro to your device using Arturias Midi Center http://www.arturia.com/support/downloads&manuals
    

Know issues
-----------

**Transport sucks**
 
* I could not reliably sync  Beatstep's tempo with Bitwig.
* Current workaround is to set sync to INT on Beatstep Pro and set same Tempo as Bitwig.


Notes & Credits 
---------------

Many thanks to https://github.com/justlep for providing Initial code & installation docs

Api Stubs
---------

  https://github.com/trappar/bitwig-api-stubs



Sysex codes
-----------

Here are the values you are looking for:

 F0  00  20  6B  7F  42  02  00  06  [kb]  [val]  F7

[kb] : 
knob number from 0x20 (knob1) to 0x2F (knob16)

[val] : 
mode value 0x00 = Absolute ; 
0x01 = Relative 1 ;
0x02 = Relative 2 ; 
0x03 = Relative 3 ;
For exemple, to set Knob 6 to Relative 2: F0  00  20  6B  7F  42  02  00  06  25  02  F7


