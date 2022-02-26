import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export async function getServerSideProps({ params }) {
  const adminName = params.admin;
  // Pass data to the page via props
  return { props: { adminName } }
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
    <div>
      <Head>
        <title>ADMIN</title>
      </Head>
      <h1>Admin Support Queue</h1>
      <div id="rooms">
      <div id="messages">
        {rooms.map(room => <div key={room} className="room"><button onClick={() => helpClient(room)} >User {room}</button></div>)}
      </div>

      </div>
    </div>
  )
}
