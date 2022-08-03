import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import AudioPlayer from "./audioPlayer";
import mediaSupported, { extensionsSupported } from "./mediaSuported";

import SubscriptionCheck from '../SubscriptionCheck/index';

const AudioRecorder = (props) => {
  console.log('Start!!!!!');
  const [isRecordering, setIsRecording] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState();
  const [mediaRecorderValue, setMediaRecorderValue ] = useState({});
  let chunks = [];
  const {
    onError,
    editor,
    onStart,
    onStop,
    onStream,
    onStreamAsString,
    maxRecordingTime,
    showPlayer,
    commandName,
    appId,
  } = props;

  const { value : commandNameValue, onChange : commandNameChangeValue } =  commandName;
  console.log('Start #1');
  const getDeviceStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = mediaSupported();
      var options = { mimeType: type }
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async (e) => {
        const blob = new Blob(chunks, { type });
        const reader = new FileReader();
        reader.onload = () => {
          setMediaRecorderValue({ stream: reader.result })
          setIsRecording(false);
          setIsRecorded(true);
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
    console.log('commandNameValue', commandNameValue);
    if (!editor && commandNameValue === "record") {
      start();
    } else if (!editor && commandNameValue === "stop") {
      stop();
    } else if (!editor && (commandNameValue === "stream" || commandNameValue === "init")) {
      const asyncOperation = async () => {
        console.log('commandNameValue', commandNameValue);
        if (commandNameValue === "stream" && (onStreamAsString || onStream)) {
            if (onStreamAsString) {
              const stream = mediaRecorderValue.stream || '';
              await onStreamAsString(stream.split(',')[1], mediaSupported());
            }
            if (onStream) {
              await onStream({ data: mediaRecorderValue.stream, filename: `fileName.${extensionsSupported()}`}, mediaSupported());
            }
            commandNameChangeValue('init');
        } else if (commandNameValue === "stream" ) {
          commandNameChangeValue('init');
        }

        setMediaRecorderValue({ stream: null });
        setIsRecording(false);
        setIsRecorded(false);
      };
      
      asyncOperation();
    }
  }, [ editor, commandNameValue ]);
  
  useEffect(() => {
    if (maxRecordingTime && mediaRecorder && isRecordering) {
      const recordingTimeout = setTimeout(() => {
        stop();
        setIsRecording(false);
      }, maxRecordingTime * 1000);
      return () => clearTimeout(recordingTimeout);
    }
  }, [maxRecordingTime, isRecordering, mediaRecorder]);

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
      setIsRecorded(false);
    }
  };
  const stop = () => {
    if (isRecordering && mediaRecorder) {
      if (onStop) onStop();
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const audioPlayerControl = () => {
    return (
        <AudioPlayer src= { mediaRecorderValue ? mediaRecorderValue.stream : null }/>
    );
  }

  const renderChildren = () => {
    return (
      <View style={styles.wrapper}>
        { ((isRecorded && showPlayer) || editor) ?  audioPlayerControl() : (<></>) }
      </View>
    )
  };

  return (<SubscriptionCheck adaloAppId = { appId }  editor={ editor }>{ renderChildren() }</SubscriptionCheck>);
};

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
  },
  iconBtn: {
    color: 'white', 
    paddingLeft: 10, 
    paddingRight: 10,
  }
});

export default AudioRecorder;
