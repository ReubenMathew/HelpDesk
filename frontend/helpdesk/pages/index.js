import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import uuid from 'react-uuid';
import { Container, Input, Row, Text, Button, Modal, Checkbox, Grid, Card, Col, Avatar } from '@nextui-org/react';

export default function Home() {

  const router = useRouter();  
  const [visible, setVisible] = React.useState(false);
  const handler = () => setVisible(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookie] = useCookies();

  const closeHandler = () => {
    setVisible(false);
    console.log('closed');
  };
  
  var CreateChat = () => {
    var newUuid = uuid();
    fetch(
      `${process.env.BACKEND_URL}/enqueue?room=${newUuid}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then(res => res)
      .then(res => {
        console.log("Response headers", res.headers.keys())
        console.log("COOKIES:", cookies);
        setCookie("access_token", res.body.token, {
          path: "/",
          maxAge: 3600,
          sameSite: true
        });
        fetch(
          `${process.env.BACKEND_URL}/${newUuid}`,
          {
            method: 'POST',
            credentials: 'include',
          }
        )
        .then(router.push(`/chat/${newUuid}`))
      });
  }

  async function signInHandler() {
    await fetch(`${process.env.BACKEND_URL}/login?username=${username}&password=${password}`).then((res) => {
      return res.json();
    }).then(res => {
      if (res.authenticated) {
        closeHandler();
        router.push(`/admin/${username}`)
      } else {
        console.log("User not found or wrong password");
      }
    });
  };

  return (
    <Container>
      <Row
        justify="center"
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      >
        <Grid xs={12} sm={7}>
          <Card cover css={{ w: '100%', p: 0 }}>
            <Card.Header css={{ position: 'absolute', zIndex: 1, top: 5 }}>
              <Col>
                <Text
                  h1
                  size={12}
                  weight="bold"
                  transform="uppercase"
                  color="#9E9E9E"
                >
                  Help Desk
                </Text>
                <Text h2 color="black">
                  We Are Here For You!
                </Text>
                <Text h1 color="black">
                  Click the button below to start chatting with us.
                </Text>
              </Col>
            </Card.Header>
            <Card.Body
              css={{ height: "50vh" }}
            >
              <Row
                justify="center"
                css={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)"
                }}
              >
                <Button
                  onClick={CreateChat}
                  size="lg"
                >
                  <Text css={{ color: 'inherit' }} size={12} weight="bold">
                    Start Chatting Anonymously
                  </Text>
                </Button>
              </Row>
            </Card.Body>
            <Card.Footer
              blur
              css={{
                position: 'absolute',
                bgBlur: '#0f1114',
                borderTop: '$borderWeights$light solid $gray700',
                bottom: 0,
                zIndex: 1
              }}
            >
              <Row>
                <Col>
                  <Row>
                    <Col span={3}>
                      <Avatar squared text="A" size="md" />
                    </Col>
                    <Col>
                      <Text color="#d1d1d1" size={12}>
                        Are You a Help Agent?
                      </Text>
                      <Text color="#d1d1d1" size={12}>
                        Login to Start Chatting with Clients.
                      </Text>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Row justify="flex-end">
                    <Button auto onClick={handler}>
                      <Text css={{ color: 'inherit' }} size={12} weight="bold">
                        Login
                      </Text>
                    </Button>
                    <Modal
                      blur
                      closeButton
                      aria-labelledby="modal-title"
                      open={visible}
                      onClose={closeHandler}
                    >
                      <Modal.Header>
                        <Text b size={18}>
                          Agent Login
                        </Text>
                      </Modal.Header>
                      <Modal.Body>
                        <Input
                          clearable
                          color="primary"
                          size="lg"
                          label="Username"
                          placeholder="Enter your username"
                          onChange={e => setUsername(e.target.value)}
                        />
                        <Input.Password
                          clearable
                          bordered
                          fullWidth
                          color="primary"
                          size="lg"
                          label="Password"
                          placeholder="Enter your password"
                          onChange={e => setPassword(e.target.value)}
                        />
                        <Row justify="space-between">
                          <Checkbox>
                            <Text size={14}>
                              Remember me
                            </Text>
                          </Checkbox>
                        </Row>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button auto onClick={signInHandler}>
                          Sign in
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </Row>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Grid>
      </Row>
    </Container>
  );
}
