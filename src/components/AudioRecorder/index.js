import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Platform, PermissionsAndroid } from 'react-native'
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import AudioRecord from 'react-native-audio-record';
import { Button } from "@protonapp/react-native-material-ui";
import { Buffer } from 'buffer';

let chunks = [];
const AudioRecorder = (props) => {
  const [isRecordering, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
	const [hasPermissions, setHasPermissions] = useState(false)
  const {
    onError,
    editor,
    startRecording,
    pauseRecording,
		resumeRecording,
		stopRecording,
		onStart,
		onPause,
		onResume,
		onStop,
    onStream,
    maxRecordingTime,
    styles: { recordTitle: recordTitleStyles, pauseTitle: pauseTitleStyles, resumeTitle: resumeTitleStyles, stopTitle: stopTitleStyles },
    recordTitle = "Play",
    recordBackgroundColor,
    recordIcon,
    pauseTitle = "Pause",
    pauseBackgroundColor,
    pauseIcon,
    resumeTitle = "Resume",
    resumeBackgroundColor,
    resumeIcon,
    stopTitle = "Stop",
    stopBackgroundColor,
    stopIcon,
  } = props;
  const getDeviceStream = async () => {
    try {
			AudioRecord.init({
				sampleRate: 16000,  
				channels: 1,        
				bitsPerSample: 16,  
				audioSource: 6,     
				wavFile: 'stash.wav' 
			})
			AudioRecord.on('data', data => {
				chunks.push(data)
			})
    } catch {
      if (onError) onError();
    }
  };
	const requestIOSPermission = async () => {
		const permission = await Permissions.request(PERMISSIONS.IOS.MICROPHONE)
		if (permission === 'granted') {
			return true
		}
		return false
	}
	const requestAndroidPermission = async () => {
		const permission = await Permissions.request(PERMISSIONS.ANDROID.RECORD_AUDIO)
		if (permission === 'granted') {
			return true
		}
		return false
	}
	const permissions = async () => {
    if (Platform.OS === 'ios') {
      const permission = await Permissions.check(PERMISSIONS.IOS.MICROPHONE)
      if (permission === 'granted') {
        return true
      }
      return requestIOSPermission()
    } else if (Platform.OS === 'android') {
      const permission = await Permissions.check(PERMISSIONS.ANDROID.RECORD_AUDIO)
      if (permission === 'granted') {
        return true
      }
      return requestAndroidPermission()
    }
	}
  useEffect(() => {
    if (!editor) {
			permissions().then(granted => {
				if (granted) {
					setHasPermissions(true)
					getDeviceStream()
				} else {
					if (onError) {
						onError()
					}
				}
			})
    }
  }, [editor]);
  useEffect(() => {
    if (maxRecordingTime && isRecordering) {
      const recordingTimeout = setTimeout(() => {
				stop()
        setIsRecording(false);
        setIsPaused(false);
			}, maxRecordingTime);
      return () => clearTimeout(recordingTimeout);
    }
  }, [maxRecordingTime, isRecordering]);
  useEffect(() => {
    if (!editor && startRecording === "true") {
        start();
    }
  }, [editor, startRecording]);
  useEffect(() => {
    if (!editor && pauseRecording === "true") {
        pause();
    }
  }, [editor, pauseRecording]);
  useEffect(() => {
    if (!editor && resumeRecording === "true") {
        resume();
    }
  }, [editor, resumeRecording]);
  useEffect(() => {
    if (!editor && stopRecording === "true") {
        stop();
    }
  }, [editor, stopRecording]);
  const start = () => {
		if (!isRecordering && hasPermissions) {
			if (onStart) onStart()
			AudioRecord.start();
			setIsRecording(true);
		}
  };
  const stop = () => {
    if (isRecordering && hasPermissions) {
      if (onStop) onStop();
      AudioRecord.stop();
      const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
      const reader = new FileReader();
      reader.onload = () => {
        if (onStream) {
          onStream(reader.result);
        }
        chunks = []
        setIsRecording(false);
        setIsPaused(false);
      };
      reader.readAsDataURL(blob)
    }
  };
  const pause = () => {
		if (!isPaused && isRecordering && hasPermissions) {
			if (onPause) onPause()
			AudioRecord.start();
			setIsPaused(true);
		}
	};
  const resume = () => {
		if (isPaused && isRecordering && hasPermissions) {
			if (onResume) onResume()
			AudioRecord.stop();
			setIsPaused(false);
		}
  };

	return(
    <View style={styles.wrapper}>
      <Button
        disabled={isRecordering}
        icon={recordIcon}
        text={recordTitle}
				
        onPress={start}
        style={{
          flex: 1,
          container: {
            backgroundColor: recordBackgroundColor,
          },
          text: {
            color: recordTitleStyles?.color,
            fontFamily: recordTitleStyles?.fontFamily,
            fontSize: recordTitleStyles?.fontSize,
            fontWeight: recordTitleStyles?.fontWeight,
          },
        }}
      ></Button>
      <Button
        disabled={!isRecordering || isPaused}
        icon={pauseIcon}
        text={pauseTitle}
        onPress={pause} 
        style={{
          flex: 1,
          container: {
            backgroundColor: pauseBackgroundColor,
          },
          text: {
            color: pauseTitleStyles?.color,
            fontFamily: pauseTitleStyles?.fontFamily,
            fontSize: pauseTitleStyles?.fontSize,
            fontWeight: pauseTitleStyles?.fontWeight,
          },
        }}
      ></Button>
      <Button
        disabled={!isRecordering || !isPaused}
        icon={resumeIcon}
        text={resumeTitle}
        onPress={resume}
        style={{
          flex: 1,
          container: {
            backgroundColor: resumeBackgroundColor,
          },
          text: {
            color: resumeTitleStyles?.color,
            fontFamily: resumeTitleStyles?.fontFamily,
            fontSize: resumeTitleStyles?.fontSize,
            fontWeight: resumeTitleStyles?.fontWeight,
          },
        }}
      ></Button>
      <Button
        disabled={!isRecordering}
        icon={stopIcon}
        text={stopTitle}
        onPress={stop}
        style={{
          flex: 1,
          container: {
            backgroundColor: stopBackgroundColor,
          },
          text: {
            color: stopTitleStyles?.color,
            fontFamily: stopTitleStyles?.fontFamily,
            fontSize: stopTitleStyles?.fontSize,
            fontWeight: stopTitleStyles?.fontWeight,
          },
        }}
      ></Button>
    </View>
	)
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
  },
});


export default AudioRecorder
