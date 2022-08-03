#!/bin/bash
set -e
set -x

yarn add react-native-sound
react-native link react-native-sound

yarn add react-native-audio-record
react-native link react-native-audio-record

yarn add ffmpeg-kit-react-native
react-native link ffmpeg-kit-react-native

# AndroidManifest

sed -i.bak '/ ext {/a\
\ ffmpegKitPackage = "audio-lts"
' android/build.gradle

#sed -i.bak '/minSdkVersion = 21/c\
#\ minSdkVersion = 24
#' android/build.gradle

cd android/app
cd src/main
cat <<EOF > /tmp/adalo-sed
/android.permission.INTERNET/a\\
    <uses-permission android:name="android.permission.RECORD_AUDIO" />\
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\\
EOF

sed -i.bak "$(cat /tmp/adalo-sed)" AndroidManifest.xml

echo "configured Android settings"