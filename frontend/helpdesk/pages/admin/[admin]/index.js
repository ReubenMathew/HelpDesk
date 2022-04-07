import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Card, Container, Col, Grid, Input, Row, Text, Button, Spacer, Table, styled } from '@nextui-org/react';

let socket = false;
const adminRoomName = 'AdminRoom';

export async function getServerSideProps({ params, req }) {
  const adminName = params.admin;
  let authenticated = true;
  // Pass data to the page via props if authenticated
  return { props: { adminName, authenticated } }
}

// From https://nextui.org/docs/components/table
export const StyledBadge = styled('span', {
  display: 'inline-block',
  textTransform: 'uppercase',
  padding: '$2 $3',
  margin: '0 2px',
  fontSize: '10px',
  fontWeight: '$bold',
  borderRadius: '14px',
  letterSpacing: '0.6px',
  lineHeight: 1,
  boxShadow: '1px 2px 5px 0px rgb(0 0 0 / 5%)',
  alignItems: 'center',
  alignSelf: 'center',
  color: '$white',
  variants: {
    type: {
      unattended: {
        bg: '$warningLight',
        color: '$warning'
      }
    }
  },
  defaultVariants: {
    type: 'active'
  }
});

export default function Home({ adminName, authenticated }) {

  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.BACKEND_URL);
    }
    socket.emit("join_room", adminRoomName);
    const Message = {
      room: adminRoomName,
      message: `${adminName} has joined the session.`,
      author: "System"
    }
    socket.emit("send_message", Message);
  }, []);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      console.log(msg);
      setMessages([...messages, msg]);
    });
  }, [messages]);

  useEffect(() => {
    fetch(process.env.BACKEND_URL)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        setRooms(response.rooms);
      })
  }, []);

  const sendMessage = () => {
    if (input == "") {
      return;
    }
    const Message = {
      room: adminRoomName,
      message: input,
      author: adminName,
      isImage: false
    }
    socket.emit("send_message", Message);
    setMessages([...messages, Message]);
    setInput("");
  }

  var helpClient = (room) => {
    fetch(
      `${process.env.BACKEND_URL}/${room}`,
      {
        method: 'DELETE'
      }
    );
    router.push(`${adminName}/${room}`);
  }

  const updateQueue = () => {
    fetch(process.env.BACKEND_URL)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        setRooms(response.rooms);
      })
  }

  return (
    <Container>
      <Row justify="center">
        <Text
          h1
          //auto
          size={"4vw"}
          weight="bold"
          color="black"
          justify="center"
        >
          Admin Control Panel
        </Text>
      </Row>
      <Spacer y={1} />
      <Row justify="center">
        <Col>
          <Row justify="center">
            <Text
              h1
              //auto
              size={"2vw"}
              weight="bold"
              color="black"
              justify="center"
            >
              Support Queue
            </Text>
          </Row>
          <Spacer y={1} />
          <Row>
            <Row justify="center">
              <Text
                h1
                //size={30}
                size={"2vw"}
                weight="bold"
                color="black"
                justify="center"
              >
                Unattended Cases: {rooms.length}
              </Text>
            </Row>
            <Spacer y={1} />
            <Row justify="center">
              <Button
                auto
                color="success"
                onClick={() => updateQueue()
                }
              >
                Update Queue
              </Button>
            </Row>
          </Row>
          <Spacer y={1} />
          <Row auto justify='center'>
            <Table
              bordered
              shadow={true}
              color="primary"
              aria-label="Example pagination  table"
              //css={{ width: "90vw" }}
              //css={{ width: "90vw", minWidth: "200px", maxWidth: "600px" }}
              css={{ width: "50vw" }}
            >
              <Table.Header>
                <Table.Column
                  css={{ width: "auto" }}
                  align="center"
                >Anonymous User</Table.Column>
                <Table.Column
                  css={{ width: "auto" }}
                  align="center"
                >Status</Table.Column>
                <Table.Column
                  css={{ width: "auto" }}
                  align="center"
                >Action</Table.Column>
              </Table.Header>
              <Table.Body>
                {rooms.map(
                  room =>
                    <Table.Row key={room}>
                      <Table.Cell>
                        <Text
                          h1
                          size={"80%"}
                          weight="bold"
                          color="black"
                          justify="center"
                        >
                          {room}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Row justify="center">
                          <StyledBadge type="unattended">Unattended</StyledBadge>
                        </Row>
                      </Table.Cell>
                      <Table.Cell
                      >
                        <Row justify="center">
                          <Button
                            auto
                            size="xs"
                            onClick={() => helpClient(room)}
                          >
                            Join Chat
                          </Button>
                          <Spacer x={0.5} />
                          <Button
                            auto
                            color="error"
                            size="xs"
                            onClick={() =>
                              fetch(
                                `${process.env.BACKEND_URL}/${room}`,
                                {
                                  method: 'DELETE'
                                }
                              )
                                .then(() => {
                                  updateQueue();
                                })
                            }
                          >
                            Delete
                          </Button>

                        </Row>
                      </Table.Cell>
                    </Table.Row>
                )
                }
              </Table.Body>
              <Table.Pagination
                shadow
                noMargin
                align="center"
                rowsPerPage={16}
              />
            </Table>
          </Row>
        </Col>
        <Spacer x={2} />
        <Col>
          <Row justify="center">
            <Text
              h1
              //auto
              size={"2vw"}
              weight="bold"
              color="black"
              justify="center"
            >
              Admins Chat Room
            </Text>
          </Row>
          <Spacer y={4} />
          <Row
            css={{ height: "72vh", overflow: "clip auto" }}
          //css={{ width: "90vw", minWidth: "200px", maxWidth: "600px" }}
          >
            <Grid.Container gap={5}>
              {
                messages.map(
                  msg =>
                    <Row key={msg.message.substring(0, 16)} justify={msg.author === adminName ? "flex-end" : "flex-start"}>
                      <Card
                        color={msg.author === adminName ? "success" : "primary"}
                        css={{ width: "max-content", maxWidth: "15vw", margin: "0.25rem 0 0", height: "max-content", maxHeight: "15vh" }}
                        key={msg.message}
                      >
                        {msg.message}
                        <Card.Footer>
                          <Row>
                            <Col>
                              <Row>
                                {msg.author == adminName ? "You" : msg.author}
                              </Row>
                            </Col>
                          </Row>
                        </Card.Footer>
                      </Card>
                    </Row>
                )
              }
            </Grid.Container>
          </Row>
          <Row>
            <Input
              css={{ width: "100%" }}
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
        </Col>
      </Row>
    </Container>
  )
}
