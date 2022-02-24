import React, { Component } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import ChatStyles from '../styles/Chat.module.css'

export default class Chat extends Component {
    sendMessage= (e) => {
        e.preventDefault();
        //Sending message code here
    }
  render() {
    return (
        <Container>
        <Row>
            <Col >
                <div className={ChatStyles["messages"]}>
                    <p className={ChatStyles["sent-message"]}>Hello, This is what a message sent would look like the quick brown fox jumped over the lazy dog.</p>
                    <p className={ChatStyles["received-message"]}>This is what a received message would look like.</p>
                    <p className={ChatStyles["sent-message"]}>Awesome!</p>
                </div>
            </Col>
        </Row>
        <Row>
            <Col>
                <form ref="form" style={{display: "flex"}}>
                    <input
                        className={ChatStyles["message-box"]}
                        placeholder='Enter your message here'
                        onKeyDown={ this.sendMessage }
                        ></input>
                    <Button 
                    type="submit"
                    className={ChatStyles["action-button"]}
                    style={{ marginLeft: "auto" }}
                    onClick={this.sendMessage}
                    >
                        Send Message
                    </Button>
                </form>
            </Col>
        </Row>
        {/* TODO:
            1 - Leave chat button 
            2 - File upload UI
            */}

        {/* <Row>
            <div style={{display: "flex"}}>
                <Button style={{backgroundColor: 'red', marginLeft: "auto"}} className={ChatStyles["action-button"]} variant="danger">End Chat</Button>
            </div>
        </Row> */}
        </Container>
    )
  }
}