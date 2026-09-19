# RotationMaster (fork)

This is a fork of [RotationMaster](https://github.com/Ellamental2/RotationMaster) by Ellamental2 — an Alt1 toolkit app for building and overlaying boss/combat ability rotation "cheat sheets" in RuneScape 3.

## Changes in this fork

- **Duplicate ability colour-coding** — when an ability appears more than once in a rotation, each occurrence gets its own small coloured dot in the corner of its icon. Every instance of that same ability shares its colour (e.g. every "Varanus's Mercy" is the same shade), while a different repeated ability gets a different colour. This makes it easier to keep your place in a long rotation without your eyes accidentally jumping to a different occurrence of the same ability further down the sequence.

### Example

![Rotation preview with duplicate-ability colour coding](src/assets/testingimg1.png)

## Credit

All core functionality (rotation building, the Alt1 overlay, wave/phase detection, settings) is from the original [RotationMaster](https://github.com/Ellamental2/RotationMaster) project. This fork only adds the change described above.