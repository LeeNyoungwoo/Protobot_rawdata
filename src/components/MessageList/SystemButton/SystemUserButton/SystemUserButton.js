import React, { Component } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import './SystemUserButton.css';

const databaseURL = "https://protobot-rawdata.firebaseio.com/";

export class SystemUserButton extends Component {
    extension = '.json';
    overflowCondition: '';

    constructor(props) {
        super(props);
        this.state = {
            inputButtonState: false,
        };
        this.postUtterance = this.postUtterance.bind(this);
        this.postBranch = this.postBranch.bind(this);
        this.patchUserUtterance = this.patchUserUtterance.bind(this);
        this.patchUserBranch = this.patchUserBranch.bind(this);
        this.patchChildren = this.patchChildren.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleNotapplicable = this.handleNotapplicable.bind(this);
    }

    postUtterance(utterance) {
        return fetch(`${databaseURL+'/utterances/data'+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(utterance)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(data => {
            const { domainId, prevBranch, userId, num_experiment, turn, deployedVersion } = this.props;
            const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[data.name]: true}}
            this.patchUserUtterance(data.name, userId, domainId, num_experiment, turn)
            this.postBranch(newBranch, utterance);
        });
    }

    postBranch(branch, utterance) {
        return fetch(`${databaseURL+'/tree-structure/data'+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(branch)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(data => {
            const { prevBranch, userId, domainId, num_experiment, turn } = this.props;
            const children = {[data.name]: true}
            this.patchChildren(prevBranch, children)
            this.patchUserBranch(data.name, userId, domainId, num_experiment, turn)
            this.handleCreate(utterance, data.name, false);
        });
    }

    patchUserUtterance(id, userId, domainId, num_experiment, turn) {
        return fetch(`${databaseURL+'/users/lists/domain-utterances/'+userId+'/'+domainId+'/'+num_experiment+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[id]: turn})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchUserBranch(id, userId, domainId, num_experiment, turn) {
        return fetch(`${databaseURL+'/users/lists/branches/'+userId+'/'+domainId+'/'+num_experiment+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[id]: turn})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchChildren(prevBranch, children) {
        return fetch(`${databaseURL+'/tree-structure/data/'+prevBranch+'/children/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify(children)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    handleCreate = (response, id, selected) => {
        const { similarResponse, userId, domainId, num_experiment, turn } = this.props
        if (selected){
            this.patchUserUtterance(response.uId, userId, domainId, num_experiment, turn)
            this.patchUserBranch(response.branchId, userId, domainId, num_experiment, turn)
        }
        similarResponse(response, id);
    }

    handleNotapplicable = () => {
        const { originResponse, domainId, userId, deployedVersion, preTopic, initializeTopic, numSession } = this.props;
        const newUtterance = {bot: false, text: originResponse, domain: domainId, userId: userId, version: deployedVersion, topics: preTopic, numSession: numSession}
        
        this.setState({
            inputButtonState: true,
        })

        initializeTopic();
        this.postUtterance(newUtterance);
    }

    render() {
        const { otherResponseList } = this.props;
        const { handleCreate, handleNotapplicable } = this;
        /*if ((Object.keys(otherResponseList).length > 5)){
            this.overflowCondition = 'scroll'
        }*/

        return (
            <div className="systemUserButtonBox">
                <span className="systemUserText">
                    If you can find a message with the same meaning, select it.
                </span>
                <div style={{width: '100%', marginTop: "10px", maxHeight: '250px', overflowY: this.overflowCondition}}>
                    <Segment.Group>
                        <Segment textAlign='center' style={{height: '200px', overflowY: "scroll"}}>
                            { Object.keys(otherResponseList).map(id => {
                                const response = otherResponseList[id];
                                return (
                                    <div key={id}>
                                    <div style={{height: '10px'}}></div>
                                    { this.state.inputButtonState
                                        ?   <Button fluid disabled>{response.text}</Button>
                                        :   <Button fluid onClick={handleCreate.bind(this, response, response.branchId, true)}>{response.text}</Button>
                                    }
                                    </div>
                                );
                            })}
                        </Segment>
                        <Segment textAlign='center'>
                            { this.state.inputButtonState
                                ?   <Button fluid disabled>
                                        Nothing to select
                                    </Button>
                                :   <Button fluid negative onClick={handleNotapplicable}>
                                        Nothing to select
                                    </Button>
                            }
                        </Segment>
                    </Segment.Group>
                </div>
            </div>
        );
    }
}
