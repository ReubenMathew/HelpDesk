import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import io from 'socket.io-client';
import jwt from 'jwt-decode';
import { Container, Card, Grid, Row, Input, Button, Spacer, Text } from '@nextui-org/react';

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
  
  useEffect(() => {
    router.beforePopState(({ url, as, options }) => {
      fetch(
        `${process.env.BACKEND_URL}/${room}`,
        {
          method: 'DELETE'
        }
      );
      return true
    })
  }, [])

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState(room);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.BACKEND_URL);
    }
    socket.emit("join_room", roomName);
  }, []);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      console.log(msg);
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

  const sendImage = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    const Image = {
      room: roomName,
      message: base64,
      author: `AnonymousUser ${roomName}`,
      isImage: true
    }
    console.log(Image);
    socket.emit("send_image", Image);
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

  return (
    <Container>
      <Text
        h1
        size={30}
        weight="bold"
      >
        Hello, Anonymous User!
      </Text>
      <Row
        css={{ height: "85vh", overflow: "clip auto" }}
      >
        <Grid.Container gap={5}>
          {messages.map(
            msg =>
              <Row key={msg.message} justify={msg.author === `AnonymousUser ${roomName}` ? "flex-end" : "flex-start"}>
                {
                  console.log(msg.author)
                }
                <Card
                  color={msg.author === `AnonymousUser ${roomName}` ? "success" : "primary"}
                  css={{ width: "max-content", margin: "0.25rem 0 0" }}
                  key={msg.message}
                >
                  {msg.message}
                  <Card.Footer>
                    {msg.author === `AnonymousUser ${roomName}` ? "You" : "Help Agent"}
                  </Card.Footer>
                </Card>
              </Row>
          )
          }
        </Grid.Container>
      </Row>
      <Spacer />
      <Row>
        <Input
          css={{ width: "100%" }}
          onChange={e => setInput(e.target.value)} value={input}
          clearable
          contentRightStyling={false}
          placeholder="Type your message..."
          contentRight={
            <Button
              auto
              onClick={sendMessage}>
              Send
            </Button>}
        />
      </Row>
      <input
        type="file"
        label="Image"
        name="fileUpload"
        accept=".jpeg, .png, .jpg"
        onChange={(e) => sendImage(e)}
      />
    </Container>
  )
}

export default Post;
