import React, { Component } from 'react'
import { Text, View, StyleSheet, Platform, Button, Linking } from 'react-native'

import params from '../params';

import jsonp from 'jsonp';
import axios from 'axios'

const subscriptionLibraryId = '18f98d72-9dc7-46a6-8dfb-746058ee49cc';

class SubscriptionCheck extends Component {
    state = {
		valid: true
	};

	checkInstallationNative() {
		const { adaloAppId } = this.props;

		const url = "https://us-central1-adalo-component-marketplace.cloudfunctions.net/checkInstallation";
		axios.get(`${url}?adaloAppId=${adaloAppId}&libraryId=${subscriptionLibraryId}&timestamp=${new Date().getTime()}`)
		.then(res => {
			const { valid } = res.data;
			this.setState({ valid })
		}, error => {
			console.warn('error', error)
			this.setState({ valid: false })
		});
	}

	checkInstallationWeb() {
		const { adaloAppId } = this.props;
		const callBackname = 'cb';
		const url = "https://us-central1-adalo-component-marketplace.cloudfunctions.net/checkInstallationjsonp";
		const fullUrl = `${url}?callback=${callBackname}&adaloAppId=${adaloAppId}&libraryId=${subscriptionLibraryId}&timestamp=${new Date().getTime()}`

		jsonp(fullUrl, { name: callBackname }, (err, data) => {
			if (err) {
				console.warn('error', error)
				this.setState({ valid: false })
			} else {
				const { valid } = data;
				this.setState({ valid })
			}
		});
	}

	checkInstallation() {
		if (Platform.OS === 'web')
			this.checkInstallationWeb()
		else  
			this.checkInstallationNative();
	}

	componentDidMount() {
		const { editor } = this.props;

		if (editor) return;

		if (params.COMPONENT_BUILD_MODE === 'subscription') {
			this.checkInstallation()
		}
	}

    renderNoSubscription() {
        return (
            <View style={ styles.message }>
                <Text style={{color: 'white', paddingBottom:20}}>Subscription for component is invalid. Contact to the Application developer or 
                    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://itsmi.store/')}> https://itsmi.store/</Text> to fix subscription.
                </Text>
                <Button style={{color: 'blue', paddingTop:10}} onPress={() => this.checkInstallation() } title="Try again"></Button>
            </View>
        )
    }

    render() {
        const { valid }  = this.state;
        if (!valid) {
          return (
            <View style={styles.container}>{this.renderNoSubscription()}</View>
          );
        }

        const { children } = this.props;

		if (children) {
        	return (<>{ children }</>)
		} else {
			return (<></>)
		}
      }
}

const styles = StyleSheet.create({
	row: {
		flexDirection:'row',
		textAlignVertical:'center',
		justifyContent:'center'
	},
	message: {
		padding: 20,
		backgroundColor: "grey"
	}
});

export default SubscriptionCheck;