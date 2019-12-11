```
say -o docs/greetings.wav --data-format=LEI16@48000 "Welcome to the IVR Scripting demo"
say -o docs/question.wav --data-format=LEI16@48000 "Which color do you like? 1 for red, 2 for green, 3 for blue"
say -o docs/invalid.wav --data-format=LEI16@48000 "Invalid option"
say -o docs/red.wav --data-format=LEI16@48000 "You like red"
say -o docs/green.wav --data-format=LEI16@48000 "You like green"
say -o docs/blue.wav --data-format=LEI16@48000 "You like blue"
say -o docs/bye.wav --data-format=LEI16@48000 "The demo is over, you may hang up, bye"
```
