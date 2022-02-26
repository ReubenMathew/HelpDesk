import Head from 'next/head'
import { useEffect, useState } from 'react';
import io from 'socket.io-client'

let socket = false;

export async function getServerSideProps({ params }) {
  const room = params.pid
  // Pass data to the page via props
  return { props: { room } }
}

const Post = ({ room }) => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState(room);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.BACKEND_URL);
    }
    socket.emit("join_room", roomName);
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
      author: `AnonymousUser ${roomName}`
    }
    socket.emit("send_message", Message);
    setMessages([...messages, Message]);
    setInput("");
  }

  return (
    <div>
      <Head>
        <title>HelpDesk</title>
      </Head>
      <h1>Anonymous User View</h1>
      <h3>AnonymousUser {roomName}</h3>
      <input placeholder="message" onChange={e => setInput(e.target.value)} value={input} /><button onClick={sendMessage}>send</button>
      <div id="messages">{messages.map(msg => <div key={msg.message} className="message">User {msg.author}: {msg.message}</div>)}</div>
    </div>
  )
}


export default Post;
