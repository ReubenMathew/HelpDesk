import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import io from 'socket.io-client';
import { Container, Card, Grid, Row, Input, Button, Spacer, Text, Loading, Modal, Col } from '@nextui-org/react';

let socket = false;

export async function getServerSideProps({ params, req }) {
  const cookies = req.headers.cookie;
  const room = params.pid;
  let authenticated = await fetch(`${process.env.BACKEND_URL}/verifyRoom?room=${room}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        cookie: cookies
      }
    }
  ).then(res => {
    return res.json();
  }).then((res) => {
    if (res.authentication) {
      return true;
    }
    return false;
  }).catch(e => {
    return false;
  });
  if (authenticated != true) {
    return { props: { room }, redirect: { destination: '/chat/error' } }
  }
  return { props: { room } };
}

const Post = ({ room }) => {
  const router = useRouter();
  const [cookies, setCookie] = useCookies();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState(room);
  const [fileToUpload, setFileToUpload] = useState([]);

  const [visible, setVisible] = React.useState(false);
  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
  };

  const [isWaiting, setIsWaiting] = React.useState(true);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.BACKEND_URL);
    }
    socket.emit("join_room", roomName);
  }, []);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      console.log(msg);
      if (msg.message.includes("has joined the session.")) {
        setIsWaiting(false)
      }
      setMessages([...messages, msg]);
    });
  }, [messages]);

  useEffect(() => {
    socket.on("receive_image", (img) => {
      console.log(img);
      setMessages([...messages, img]);
    });
  }, [messages]);


  const sendMessage = () => {
    if (input == "") {
      return;
    }
    const Message = {
      room: roomName,
      message: input,
      author: `AnonymousUser ${roomName}`,
      isImage: false
    }
    socket.emit("send_message", Message);
    setMessages([...messages, Message]);
    setInput("");
  }

  const sendImage = async () => {
    if (fileToUpload == "") {
      return;
    }
    const file = fileToUpload;
    const base64 = await convertToBase64(file);
    const Image = {
      room: roomName,
      message: base64,
      author: `AnonymousUser ${roomName}`,
      isImage: true
    }
    console.log(Image);
    socket.emit("send_image", Image);
    setMessages([...messages, Image]);
    closeHandler()
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const endChat = () => {
    fetch(
      `${process.env.BACKEND_URL}/${room}`,
      {
        method: 'DELETE'
      }
    )
    router.push("/")
    return true
  }


  return (
    <Container>
      <Modal
        preventClose
        blur
        aria-labelledby="modal-title"
        open={isWaiting}
        css={{ height: "35vh", width: "50vw" }}
      >
        <Modal.Body>
          <Row justify="center">
            <h3>
              Waiting for an agent...
            </h3>
          </Row>
          <Spacer y={2.5} />
          <Row justify="center">
            <Loading
              type="points"
              loadingCss={{ $$loadingSize: "30px", $$loadingBorder: "10px" }}
            />
          </Row>
          <Spacer y={2} />
          <Row justify='center'>
            <Button
              color="error"
              auto
              onClick={endChat}
            >
              <Text css={{ color: 'inherit' }} size={12} weight="bold">
                Leave Queue
              </Text>
            </Button>
          </Row>
        </Modal.Body>
      </Modal>
      {
        !isWaiting ?       <Container>
        <Text
          h1
          size={30}
          weight="bold"
        >
          Hello, Anonymous User!
        </Text>
        <Text
          h2
          size={25}
          weight="bold"
        >
          You are now chatting with a help agent.
        </Text>
        <Row
          css={{ height: "80vh", overflow: "clip auto" }}
        >
          <Grid.Container gap={5}>
            {messages.map(
              msg =>
                <Row key={msg.message} justify={msg.author === `AnonymousUser ${roomName}` ? "flex-end" : "flex-start"}>
                  <Card
                    color={msg.author === `AnonymousUser ${roomName}` ? "success" : "primary"}
                    css={{ width: "max-content", maxWidth: "45vw", margin: "0.25rem 0 0", height: "max-content", maxHeight: "45vw" }}
                    key={msg.message}
                  >
                    {msg.isImage ?
                      <img src={msg.message} />
                      : msg.message}
                    <Card.Footer>
                      <Row>
                        <Col>
                          <Row>
                            {msg.author === `AnonymousUser ${roomName}` ? "You" : "Help Agent"}
                          </Row>
                        </Col>
  
                        {msg.isImage ?
                          <Col>
                            <Row justify="flex-end">
                              <Button
                                auto
                                rounded
                                css={{ color: "white", bg: "black" }}
                              >
                                <a
                                  download={`DownloadedFile.${msg.message.substring("data:image/".length, msg.message.indexOf(";base64"))}`}
                                  css={{ color: "inherit" }}
                                  size={12}
                                  weight="bold"
                                  transform="uppercase"
                                  href={msg.message}
                                >
                                  Download File
                                </a>
                              </Button>
                            </Row>
                          </Col>
                          : null
                        }
                      </Row>
                    </Card.Footer>
                  </Card>
                </Row>
            )
            }
          </Grid.Container>
        </Row>
        <Spacer />
        <Row justify="center">
          <Button
            color="primary"
            css={{
              borderTopRightRadius: "0px",
              borderBottomRightRadius: "0px"
            }}
            auto
            onClick={handler}
          >
            <Text css={{ color: 'inherit' }} size={12} weight="bold">
              Send File
            </Text>
          </Button>
          <Spacer x={0.2} />
          <Button
            color="error"
            css={{
              borderTopLeftRadius: "0px",
              borderBottomLeftRadius: "0px"
            }}
            auto
            onClick={endChat}
          >
            <Text css={{ color: 'inherit' }} size={12} weight="bold">
              End Chat
            </Text>
          </Button>
        </Row>
        <Spacer />
        <Row>
          <Input
            css={{
              width: "100%",
            }}
            onChange={e => setInput(e.target.value)} value={input}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                { sendMessage() }
              }
            }}
            clearable
            contentRightStyling={false}
            placeholder="Type your message..."
            contentRight={
              <Row>
                <Spacer x={0.5} />
                <Button
                  color="primary"
                  css={{
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px"
                  }}
                  auto
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </Row>
            }
          />
        </Row>
        <Modal
          blur
          closeButton
          aria-labelledby="modal-title"
          open={visible}
          onClose={closeHandler}
        >
          <Modal.Header>
            <Text b size={18}>
              File Upload
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Text>
              Click browse to select files to upload. Accepted file types are *.jpg, *.jpeg, *.png
            </Text>
            <Spacer />
            <input
              type="file"
              name="fileUpload"
              accept=".jpeg, .png, .jpg"
              onChange={(e) => setFileToUpload(e.target.files[0])}
            >
            </input>
          </Modal.Body>
          <Modal.Footer justify='center'>
            <Spacer y={3} />
            <Button
              auto
              justify="center"
              css={{ width: "50%", justify: "center" }}
              onClick={() => sendImage()}
            >
              Upload
            </Button>
          </Modal.Footer>
        </Modal>
        </Container> : null
      }
    </Container>
  )
}

export default Post;
