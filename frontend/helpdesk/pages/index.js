import Head from 'next/head';
import { useRouter } from 'next/router';
import uuid from 'react-uuid';

import { Card, Grid, Col, Row, Text, Button, Spacer } from '@nextui-org/react';

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
    <Row justify="center">
      <Button onClick={CreateChat} size="lg">
        <Text css={{ color: 'inherit' }} size={12} weight="bold" transform="uppercase">
          Start Chatting Annonymously
        </Text>
      </Button>
    </Row>
  );
}
