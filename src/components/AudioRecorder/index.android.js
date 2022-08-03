import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Platform, PermissionsAndroid } from 'react-native'
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import AudioRecord from 'react-native-audio-record';
import { Buffer } from 'buffer';
import mediaSupported, { extensionsSupported } from "./mediaSuported";
import AudioPlayer from './NativeAudioRecorder';

import { FFmpegKit } from 'ffmpeg-kit-react-native';

import SubscriptionCheck from '../SubscriptionCheck/index';

import RNFS from 'react-native-fs';
import axios from 'axios';

const re = /(?:\.([^.]+))?$/;
const getFilenameFromPath = path => path.substring(path.lastIndexOf('/') + 1);
const getExtensionFromFilename = fileName => re.exec(fileName)[1];

const storeFile = async (fileName, data) => {
    let requestFilename = getFilenameFromPath(fileName).toLowerCase();
    const extension = getExtensionFromFilename(fileName);
   
    if (Platform.OS === 'android') {
       requestFilename = 'android_long_name_' + requestFilename;
    }
    console.log('Android filename:', requestFilename, extension);

    try {
      const result = await axios.post('https://database-red.adalo.com/uploads', {
          filename: requestFilename,
          data: data
      });
  

      console.log('Android result:', result);
      const uri = `https://adalo-uploads.imgix.net/${result.data.url}`
      // await onChange({ filename: result.data.filename, size: result.data.size, cache: "force-cache", url:result.data.url, uri });
      return { filename: result.data.filename, size: result.data.size, cache: "force-cache", url:result.data.url, uri };
    }
    catch (error) {
      console.log('Android Error:', error);
      throw error;
    }
};

const getPureDataByUri = async (uri) => {
    if (!uri || uri === '') { 
        return null;
    }
    return await RNFS.readFile(uri, 'base64');
};

const AudioRecorder = (props) => {
  const [isRecordering, setIsRecording] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
	const [hasPermissions, setHasPermissions] = useState(false)
  const [mediaRecorderValue, setMediaRecorderValue ] = useState({});
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
    appId
  } = props;

  console.log('commandName', commandName);
  const { value : commandNameValue, onChange : commandNameChangeValue } =  commandName;

  const getDeviceStream = async () => {
    try {
      console.log('AudioRecord.pre-init')
			AudioRecord.init({
				sampleRate: 16000,  
				channels: 1,        
				bitsPerSample: 16,  
				audioSource: 6,     
				wavFile: 'stash.wav' 
			})
      console.log('AudioRecord.init')
			AudioRecord.on('data', data => {
        const chunk = Buffer.from(data, 'base64');
        console.log('chunk size', chunk.byteLength);
        // do something with audio chunk
      });
    } catch {
      console.log('errors');
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
        commandNameChangeValue('stop');
			}, maxRecordingTime * 1000);
      return () => clearTimeout(recordingTimeout);
    }
  }, [maxRecordingTime, isRecordering]);

  const start = () => {
		if (!isRecordering && hasPermissions) {
			if (onStart) onStart()
			AudioRecord.start();
			setIsRecording(true);
		}
  };
  const stop = async () => {
    if (isRecordering && hasPermissions) {
      if (onStop) onStop();

      let audioFile = await AudioRecord.stop();
      setIsRecording(false);
      setIsRecorded(true);
      setMediaRecorderValue({ filename: audioFile })
      console.log('audioFile', audioFile);
    }
  };

  useEffect(() =>  {
    console.log('commandNameValue', commandNameValue);

    if (!editor && commandNameValue === "record") {
      start();
    } else if (!editor && commandNameValue === "stop") {
      stop();
    } else if (!editor && (commandNameValue === "stream" || commandNameValue === "init")) {
      const asyncOperation = async () => {
        if (commandNameValue === "stream" && (onStreamAsString || onStream)) {
          const { filename } = mediaRecorderValue;

          const mp3File = filename.replace('wav', 'mp3');

          console.log('start transfer', filename, mp3File);
          // await transcode(filename, "mystash.mp3", true);
          const result = await FFmpegKit.execute(`-i ${filename} -codec:a libmp3lame -qscale:a 2 ${mp3File}`);
          console.log('finish transfer', result);

          const data = await getPureDataByUri(mp3File);

          if (onStreamAsString) {
            await onStreamAsString(data, mediaSupported());
          }
          
          if ( onStream) {    
            const storedFile = await storeFile(mp3File, data);      
            await onStream(storedFile, mediaSupported());
          }
          RNFS.unlink(filename);
          RNFS.unlink(mp3File);
    
          commandNameChangeValue('init');
        } else if (commandNameValue === "stream" ) {
          commandNameChangeValue('init');
        }

        setMediaRecorderValue({ filename: null });
        setIsRecording(false);
        setIsRecorded(false);
      };

      asyncOperation();
    }
  }, [ editor, commandNameValue ]);

	return(
    <SubscriptionCheck adaloAppId = { appId }   editor = { editor }>
      <View style={styles.wrapper}>
        { ((isRecorded && showPlayer) || editor) ?  (<AudioPlayer stream={mediaRecorderValue.filename}></AudioPlayer>) : (<></>) }
      </View>
    </SubscriptionCheck>
	)
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "row",
  },
});

export default AudioRecorder