import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Button } from "@protonapp/react-native-material-ui";

const AudioRecorder = (props) => {
  const [isRecordering, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState();
  let chunks = [];
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
    styles: {
      recordTitle: recordTitleStyles,
      pauseTitle: pauseTitleStyles,
      resumeTitle: resumeTitleStyles,
      stopTitle: stopTitleStyles,
    },
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
    controlType = "builtIn",
  } = props;
  const getDeviceStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      mediaRecorder.onstop = async (e) => {
        debugger;
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        const reader = new FileReader();
        reader.onload = () => {
          if (onStream) {
            onStream(reader.result);
          }
          setIsRecording(false);
          setIsPaused(false);
          chunks = [];
        };
        reader.readAsDataURL(blob);
      };
      setMediaRecorder(mediaRecorder);
    } catch {
      if (onError) onError();
    }
  };
  useEffect(() => {
    if (maxRecordingTime && mediaRecorder && isRecordering) {
      const recordingTimeout = setTimeout(() => {
        stop();
        setIsRecording(false);
        setIsPaused(false);
      }, maxRecordingTime);
      return () => clearTimeout(recordingTimeout);
    }
  }, [maxRecordingTime, isRecordering, mediaRecorder]);
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
  useEffect(() => {
    if (!editor) {
      getDeviceStream();
    }
  }, [editor]);
  const start = () => {
    if (!mediaRecorder) {
      getDeviceStream();
    }

    if (!isRecordering && mediaRecorder) {
      if (onStart) onStart();
      mediaRecorder.start();
      setIsRecording(true);
    }
  };
  const stop = () => {
    if (isRecordering && mediaRecorder) {
      if (onStop) onStop();
      debugger;
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  const pause = () => {
    if (!isPaused && isRecordering && mediaRecorder) {
      if (onPause) onPause();
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };
  const resume = () => {
    if (isPaused && isRecordering && mediaRecorder) {
      if (onResume) onResume();
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };
  if (controlType === "builtIn") {
    return (
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
    );
  }
  return <View />;
};

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
  },
});

export default AudioRecorder;
