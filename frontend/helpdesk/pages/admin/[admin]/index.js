import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Row, Text, Button, Spacer, Table, styled } from '@nextui-org/react';


export async function getServerSideProps({ params }) {
  const adminName = params.admin;
  // Pass data to the page via props
  return { props: { adminName } }
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
          Admin Support Queue
        </Text>
      </Row>
      <Spacer y={0.5} />
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
      <Spacer y={1} />
      <Row auto justify='center'>
        <Table
          bordered
          shadow={true}
          color="primary"
          aria-label="Example pagination  table"
          //css={{ width: "90vw" }}
          css={{width: "90vw", minWidth: "200px", maxWidth: "600px" }}
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
            rowsPerPage={15}
          />
        </Table>
      </Row>
    </Container>
  )
}
