# IVR Scripting Demo

## How to generate audio

```
say -o greetings.wav --data-format=LEI16@48000 "Welcome to the world of RingCentral IVR Scripting, we are so exicted to have you here."
```

## How to play audio

```
play -e signed -c 1 -b 16 -r 48000 greetings.wav
```
