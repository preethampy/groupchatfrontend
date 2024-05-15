import React, { useRef } from 'react'
import { Container, Stack, Card, Form, Button } from 'react-bootstrap'
import { IoSend } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
import { BiSolidMessageDots } from "react-icons/bi";
import { FaFileDownload } from "react-icons/fa";
import store from '../app/store';
import { Chip } from '@mui/material';
import config from '../config';
import { useState } from 'react';
import { socket } from '../Socketio';
import toast from 'react-hot-toast';
import styles from ".././styles/cs.module.css";

export default function ChatBody({ group }) {
    const authDetails = store.getState();
    const [fileToSend, setFileToSend] = useState(null);
    const [showFileInput, setShowFileInput] = useState(false);
    const [myMessage, setMyMessage] = useState("");
    const fileRef = useRef(null)

    function messageHandler(e) {
        e.preventDefault();
        if (fileToSend) {
            socket.emit("message",
                {
                    roomName: group.group.name,
                    roomId: group.group._id,
                    message: null,
                    typeOfFile: fileToSend.type,
                    fileName: fileToSend.name
                },
                fileToSend);
        }
        else {
            if (showFileInput == true) {
                toast.error("Please switch to messaging or select file to send!")
            }
            else {
                socket.emit("message",
                    {
                        roomName: group.group.name,
                        roomId: group.group._id,
                        message: myMessage,
                        typeOfFile: "text",
                        file: null
                    });
            }
        }
        resetInputs();
    }

    function resetInputs() {
        setMyMessage("");
        setFileToSend(null);
        fileRef.current.value = null
    }

    return (
        <Card className={styles.chatCard}>
            <Card.Header className={styles.chatNoBorder}>
                <Card.Title className={styles.chatBold}>{group.group.name}</Card.Title>
                <Card.Subtitle>
                    Created by {group.group.created_by.name}
                </Card.Subtitle>
            </Card.Header>
            <Card.Body className={styles.chatScroll}>
                {group.chats.map((item, index) => {
                    return <Container key={index} fluid className='m-2' style={item.from.name == authDetails.auth.name ? { textAlign: "end" } : {}}>
                        <p className={styles.chatNoMargin}>{item.from.name}</p>
                        {item.typeOfFile == "text" &&
                            <Chip label={item.message} style={{backgroundColor:'#27005d',borderColor:"#27005d", color:"white"}} size='medium' />
                        }
                        {item.typeOfFile == "image" &&
                            <img src={config.uploads + item.fileName} alt="Lamp" className={styles.chatImage} />
                        }
                        {item.typeOfFile !== "text" && item.typeOfFile !== "image" &&
                            <a href={config.uploads + item.fileName} download>
                                <Chip label={<FaFileDownload size={20} />} clickable={true} style={{backgroundColor:'#27005d',borderColor:"#27005d", color:"white"}} size='medium' />
                            </a>
                        }
                    </Container>
                })}
            </Card.Body>
            <Card.Footer className={styles.chatNoBorder}>
                <Form onSubmit={messageHandler}>
                    <Form.Group className="mb-3" >
                        <Stack gap={"2"} direction='horizontal'>
                            <Form.Control onChange={(e) => { setMyMessage(e.target.value) }} value={myMessage} type="text" as="textarea" name='message' placeholder="Type your message here..." rows={1} style={{ backgroundColor: "#ffffff", display: showFileInput ? "none" : "flex" }} />
                            <Form.Group controlId="formFile" style={{ display: showFileInput ? "flex" : "none", alignItems: "baseline", width: "100%" }}>
                                <Form.Control ref={fileRef} onChange={(e) => { setFileToSend(e.target.files[0]); }} type="file" name="customFile" />
                            </Form.Group>
                            <Button onClick={() => { setShowFileInput(!showFileInput) }} size='sm' className={styles.chatBtn}>{showFileInput == false ? <IoIosAttach size={20} /> : <BiSolidMessageDots size={20} />}</Button>
                            <Button size='sm' type='submit' className={styles.chatBtn}><IoSend size={20} /></Button>
                        </Stack>
                    </Form.Group>
                </Form>
            </Card.Footer>
        </Card>
    )
}
