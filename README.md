# Arturia Beatstep Pro Controller Script for Bitwig
Bitwig controller Script for Arturia Beatstep Pro

Features:
---------

**Control Mode:**

* Support for relative control changes 
* Automaping of rotaries (1-4, 9-12) to Device Macro 1-8
* Rotaries 5-8, 13-16 are freely assignable.
* Step button 15 and 16 : Previous / next preset of active device   

**Global**

* Transport buttons start / stop Bitwig 


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
