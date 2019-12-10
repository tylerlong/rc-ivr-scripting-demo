# IVR Scripting Demo

## How to generate audio?

```
say -o greetings.wav --data-format=LEI16@48000 "Welcome to the world of RingCentral IVR Scripting, we are so exicted to have you here."
```

## How to play audio?

```
play -e signed -c 1 -b 16 -r 48000 greetings.wav
```


## Why Lambda proxy?

Because:
1. We want to send HTTP responses as soon as possible
1. We also want to take our time to do things in the background.

Proxy with respond quickly and start a thread to continue to do things.
