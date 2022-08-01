#!/bin/bash
set -e
set -x

name=$PROJECT_NAME

yarn add react-native-sound
react-native link react-native-sound

yarn add react-native-audio-record
react-native link react-native-audio-record

if grep -q "<key>NSMicrophoneUsageDescription" ios/$name/Info.plist; then
  echo "Location already supported, nothing to do here."
else
  plutil -insert NSMicrophoneUsageDescription -string 'This app needs access to microphone to record your voice' ios/$name/Info.plist
fi

echo "configured iOS settings"