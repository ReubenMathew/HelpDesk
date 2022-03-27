import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Row, Text, Button, Grid, Card, Spacer } from '@nextui-org/react';

export async function getServerSideProps({ params }) {
  const adminName = params.admin;
  // Pass data to the page via props
  const cookies = req.headers.cookie;
  let authenticated = await fetch(`${process.env.BACKEND_URL}/verifyRoom?room=`,
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
  return { props: { adminName } };
}

export default function Home({ adminName }) {

  const router = useRouter();

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch(process.env.BACKEND_URL)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        console.log(response.rooms);
        setRooms(response.rooms);
      })
  }, [])

  var helpClient = (room) => {
    fetch(
      `${process.env.BACKEND_URL}/${room}`,
      {
        method: 'DELETE'
      }
    );
    router.push(`${adminName}/${room}`);
  }

  return (
    // <div>
    //   <Head>
    //     <title>ADMIN</title>
    //   </Head>
    //   <h1>Admin Support Queue</h1>
    //   <div id="rooms">
    //   <div id="messages">
    //     {rooms.map(room => <div key={room} className="room"><button onClick={() => helpClient(room)} >User {room}</button></div>)}
    //   </div>
    //   </div>
    // </div>
    <Container>
      <Row justify="center">
        <Text
          h1
          size={60}
          weight="bold"
          color="black"
          justify="center"
        >
          Admin Support Queue
        </Text>
      </Row>
      <Spacer y={5} />
      <Grid.Container gap={5}>
        {rooms.map(
          room =>
            <Row key={room} justify="center">
              <Card
                color="primary"
                css={{ width: "max-content", margin: "0.25rem 0 0" }}
                key={room}
              >
                {/* <button onClick={() => helpClient(room)} >User {room}</button> */}

                <Button
                  size="lg"
                  onClick={() => helpClient(room)}
                >
                  User {room}
                </Button>
              </Card>
              <Spacer y={5} />
            </Row>
        )
        }
      </Grid.Container>
    </Container>
  )
}
