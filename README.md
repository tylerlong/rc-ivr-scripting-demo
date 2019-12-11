# IVR Scripting Demo

## The user case

```
Phone: Welcome to the IVR Scripting demo!
Phone: Which color do you like? 1 for red, 2 for green, 3 for blue
Customer: 4
Phone: Invalid option
Phone: Which color do you like? 1 for red, 2 for green, 3 for blue
Customer: 2
Phone: You like green
```

## How to generate audio?

```
say -o docs/greetings.wav --data-format=LEI16@48000 "Welcome to the IVR Scripting demo"
```

### How to play audio locally?

```
play -e signed -c 1 -b 16 -r 48000 docs/greetings.wav
```


## Why Lambda proxy?

Because:
1. We want to send HTTP responses as soon as possible
1. We also want to take our time to do things in the background.

Proxy with respond quickly and start a thread to continue to do things.
