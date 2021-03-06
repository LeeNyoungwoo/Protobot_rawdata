import React, { Component } from 'react';
import { Modal } from 'semantic-ui-react'
import './Quit.css'

// const databaseURL = "https://protobot-rawdata.firebaseio.com/"

export class Quit extends Component {
    constructor(props){
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <Modal size={'small'} open={true}>
                <Modal.Header>End the experiment</Modal.Header>
                    <Modal.Content>
                        <div style={{fontSize: '15px'}}>Thank you for your participation!</div>
                        <div style={{fontSize: '15px'}}>Please go back to the MTurk website, and submit the verified code: <b>39dwjlkd17</b></div>
                        <div style={{fontSize: '15px', marginTop:"10px"}}>Thanks!</div>
                    </Modal.Content>
            </Modal>
        );
    }
}