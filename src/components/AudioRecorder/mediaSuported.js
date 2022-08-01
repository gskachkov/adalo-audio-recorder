import { Platform } from 'react-native';

function mediaSupported() {
  // safari used to not support this
  // ...even if it supported media recorder
  if (Platform.OS === 'android') return 'audio/mp3';

  if(!MediaRecorder.isTypeSupported) {
    return "audio/mp4"
  } else if(MediaRecorder.isTypeSupported('audio/webm')) {
    return "audio/webm"
  } else {
    return "audio/mp4"
  }
}

function extensionsSupported () {
  if (Platform.OS === 'android') return 'mp3';

  if(!MediaRecorder.isTypeSupported) {
    return "mp4"
  } else if(MediaRecorder.isTypeSupported('audio/webm')) {
    return "webm"
  } else {
    return "mp4"
  }
}

export default mediaSupported;

export { extensionsSupported };