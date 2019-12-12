# IVR Scripting Demo

## Live demo

Call 517-879-5131 and dial extension 1


## The user case

```
Phone: Welcome to the IVR Scripting demo!
Phone: Which color do you like? 1 for red, 2 for green, 3 for blue
Customer: 4
Phone: Invalid option
Phone: Which color do you like? 1 for red, 2 for green, 3 for blue
Customer: 2
Phone: You like green
Phone: The demo is over, you may hang up, bye
```

## Setup

```
cp .env.sample.yml .env.yml
```

Edit `.env.yml`, specify `RINGCENTRAL_TOKEN`. Also set password for database (search for "username" & "password" and replace them)


## Deploy

```
npx sls deploy
```


## Setup database

```
curl -X PUT https://<aws-api-gateway-uri>/prod/setup-database
```


## Misc.

### How to generate audio for testing?

```
say -o docs/greetings.wav --data-format=LEI16@48000 "Welcome to the IVR Scripting demo"
```

### How to play audio locally?

```
play -e signed -c 1 -b 16 -r 48000 docs/greetings.wav
```


### Why Lambda proxy?

Because:
1. We want to send HTTP responses as soon as possible
1. We also want to take our time to do things in the background.

Proxy will respond quickly and start a thread to continue to do things.
