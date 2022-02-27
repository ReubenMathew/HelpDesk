import { useEffect, useState } from 'react';
import io from 'socket.io-client'
import { Container, Card, Grid, Row, Input, Button, Spacer, Text } from '@nextui-org/react';


let socket = false;

export async function getServerSideProps({ params }) {
  const room = params.room;
  const adminName = params.admin;
  // Pass data to the page via props
  return { props: { room, adminName } }
}

const Post = ({ room, adminName }) => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState(room);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.BACKEND_URL);
    }
    socket.emit("join_room", roomName);
    const Message = {
      room: roomName,
      message: `${adminName} has joined the session.`,
      author: "System"
    }
    socket.emit("send_message", Message);
  }, [])

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      console.log(msg);
      setMessages([...messages, msg]);
    })
  }, [messages]);

  const sendMessage = () => {
    if (input == "") {
      return;
    }
    const Message = {
      room: roomName,
      message: input,
      author: adminName
    }
    socket.emit("send_message", Message);
    setMessages([...messages, Message]);
    setInput("");
  }

  return (
    <Container>
      <Text
        h1
        size={30}
        weight="bold"
      >
        Hello, Agent!
      </Text>
      <Text
        h2
        size={25}
        weight="bold"
      >
        You are now chatting with {room}.
      </Text>
      <Row
        css={{ height: "85vh", overflow: "clip auto"}}
      >
        <Grid.Container gap={5}>
          {messages.map(
            msg =>
              <Row key={msg.message} justify={msg.author !== `AnonymousUser ${roomName}` ? "flex-end" : "flex-start"}>
                {
                  console.log(msg.author)
                }
                <Card
                  color={msg.author !== `AnonymousUser ${roomName}` ? "success" : "primary"}
                  css={{ width: "max-content", margin: "0.25rem 0 0" }}
                  key={msg.message}
                >
                  {msg.message}
                  <Card.Footer>
                    {msg.author !== `AnonymousUser ${roomName}` ? "You" : "Annonymous Client"}
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
    </Container>

  )
}


export default Post;
