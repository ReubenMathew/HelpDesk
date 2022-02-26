import React from 'react';
import { useRouter } from 'next/router';
import uuid from 'react-uuid';
import { Container, Input, Mail, Row, Text, Button, Modal, Password, Checkbox } from '@nextui-org/react';
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
  const [visible, setVisible] = React.useState(false);
  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
    console.log('closed');
  };

  return (
    <Container>
      <Row justify="center">
        <Button
          onClick={CreateChat}
          size="lg"
        >
          <Text css={{ color: 'inherit' }} size={12} weight="bold" transform="uppercase">
            Start Chatting Annonymously
          </Text>
        </Button>
      </Row>
      {/* <Row>
          <Button auto shadow onClick={handler}>
            Open modal
          </Button>
          <Modal
            closeButton
            aria-labelledby="modal-title"
            open={visible}
            onClose={closeHandler}
          >
            <Modal.Header>
              <Text id="modal-title" size={18}>
                Welcome to
                <Text b size={18}>
                  NextUI
                </Text>
              </Text>
            </Modal.Header>
            <Modal.Body>
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="lg"
                placeholder="Email"
                contentLeft={<Mail />}
              />
              <Input
                clearable
                bordered
                fullWidth
                color="primary"
                size="lg"
                placeholder="Password"
                contentLeft={<Password />}
              />
              <Row justify="space-between">
                <Checkbox>
                  <Text size={14}>
                    Remember me
                  </Text>
                </Checkbox>
                <Text size={14}>
                  Forgot password?
                </Text>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button auto flat color="error" onClick={closeHandler}>
                Close
              </Button>
              <Button auto onClick={closeHandler}>
                Sign in
              </Button>
            </Modal.Footer>
          </Modal>
        </Row> */}
    </Container>
  );
}
