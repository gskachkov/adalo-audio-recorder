import React, { Component } from 'react'

import { createElement } from 'react-native-web';
import mediaSupported from "./mediaSuported";


function sourceElement (props) {
    const { src } = props;
    const type = mediaSupported();
    return createElement('source',  {src, type });
}

export default function (props) {
    return createElement('audio', { controls: true, width:100, height:30 }, sourceElement(props)); 
};