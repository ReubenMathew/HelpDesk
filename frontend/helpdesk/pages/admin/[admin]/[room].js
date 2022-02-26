import Head from 'next/head'
import { useEffect, useState } from 'react';
import io from 'socket.io-client'

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
      message: `${adminName} has joined the Session`,
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
    <div>
      <Head>
        <title>Admin View</title>
      </Head>
      <h1>Admin Chat View</h1>
      <h3>{adminName} chatting with AnonymousUser{room}</h3>
      <input placeholder="message" onChange={e => setInput(e.target.value)} value={input} /><button onClick={sendMessage}>send</button>
      <div id="messages">{messages.map(msg => <div className="message">{msg.author}: {msg.message}</div>)}</div>
    </div>
  )
}


export default Post;
