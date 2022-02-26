import Head from 'next/head';
import { useRouter } from 'next/router';
import uuid from 'react-uuid';

export default function Home() {

  const router = useRouter();

  var CreateChat = () => {

    var newUuid = uuid();

    fetch(
      `${process.env.BACKEND_URL}/${newUuid}`,
      {
        method: 'POST'
      }
    ).then(router.push(`/chat/${newUuid}`));

  }

  return (
    <div>
      <Head>
        <title>HelpDesk</title>
      </Head>
      <h1>Welcome to Help Desk</h1>
      <button onClick={CreateChat}>New Chat</button>
    </div >
  );
}
