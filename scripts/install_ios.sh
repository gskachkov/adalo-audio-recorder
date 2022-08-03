#!/bin/bash
set -e
set -x

name=$PROJECT_NAME

alias react-native="$(pwd)/node_modules/.bin/react-native"

yarn add react-native-sound
react-native link react-native-sound

yarn add react-native-audio-record
react-native link react-native-audio-record

yarn add ffmpeg-kit-react-native
react-native link ffmpeg-kit-react-native

if grep -q "<key>NSMicrophoneUsageDescription" ios/$name/Info.plist; then
  echo "Location already supported, nothing to do here."
else
  plutil -insert NSMicrophoneUsageDescription -string 'This app needs access to microphone to record your voice' ios/$name/Info.plist
fi

cd ios

sed -i.bak '/config = use_native_modules!/c\
    pod "ffmpeg-kit-react-native", :subspecs => ["audio-lts"], :podspec => "../node_modules/ffmpeg-kit-react-native/ffmpeg-kit-react-native.podspec"\
    config = use_native_modules!\
' Podfile

pod install

echo "configured iOS settings"