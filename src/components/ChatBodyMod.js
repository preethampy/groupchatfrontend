import React, { useEffect, useRef } from 'react'
import { Container, Stack, Card, Form, Button, Spinner } from 'react-bootstrap'
import { IoSend } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
import { BiSolidMessageDots } from "react-icons/bi";
import { FaFileDownload } from "react-icons/fa";
import store from '../app/store';
import { Chip } from '@mui/material';
import config from '../config';
import { FaArrowAltCircleDown } from "react-icons/fa";
import { useState } from 'react';
import { socket } from '../Socketio';
import toast from 'react-hot-toast';
import styles from ".././styles/cs.module.css";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ChatBodyMod() {

    const wholeUrl = useLocation();
    const id = wholeUrl.pathname.split("/").pop();

    const authDetails = store.getState();
    const state = useSelector((state) => state.groups);

    const [group, setGroup] = useState();
    const [isReady, setIsReady] = useState();
    const [fileToSend, setFileToSend] = useState(null);
    const [showFileInput, setShowFileInput] = useState(false);
    const [myMessage, setMyMessage] = useState("");

    const fileRef = useRef(null)
    const divRef = useRef(null)

    /**
     * This function will get current state data of myGroups from redux store's groups reducer.
     * Then we will find the group based on param called id of current page that is fetched from current url.
     * We will finally set the current group state to the group we found.
     */

    function commonFunc() {
        const myGroups = store.getState().groups.myGroups;
        const group = myGroups.find((obj) => obj._id === id);
        setGroup(group);
        setIsReady(true)
    }

    /**
     * This funtion is called when scroll icon button is pressed.
     * It will help to scroll down to last message
     */

    function scrollToBottom() {
        divRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        commonFunc();

        /**
         * Below we subscribed to redux store to get real time updates everytime the redux store state is updated.
         * Then we call commonFunc() function to get and set any updated data.
         */
        const unsubscribe = store.subscribe(changes);
        function changes() {
            commonFunc();
            unsubscribe();
        }
    }, [id, state])

    /**
     * This function will be called when user wants to join a new group.
     * We will emit "join room" event and listen for updates in Root.js file which is the only parent page to all other pages.
     */

    function joinHandler() {
        socket.emit("join room", {
            groupId: id,
        });
    }

    /**
     * This function will be called when a button is clicked to send the message typed.
     * We first check if any file is selected or not and based on that condition we will emit "message" event with given and necessary data.
     * Then we will call resetInputs() function.
     * @param {*} e - It has event data when the send button is clicked, we will use it to prevent the page from reloading
     */

    function messageHandler(e) {
        e.preventDefault();
        if (fileToSend) {
            socket.emit("message",
                {
                    roomName: group.name,
                    roomId: group._id,
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
                        roomName: group.name,
                        roomId: group._id,
                        message: myMessage,
                        typeOfFile: "text",
                        file: null
                    });
            }
        }
        resetInputs();
    }

    /**
     * This function will be called after a message is sent, it will reset the message and file state so we can type/select new message/file.
     */

    function resetInputs() {
        setMyMessage("");
        setFileToSend(null);
        fileRef.current.value = null
    }

    // If isReady is true and group is not undefined (means we already joined this group) then we return this
    if (isReady && group) {
        return (
            <div className={styles.mainHei90}>
                <Card className={styles.chatCard}>
                    <Card.Header className={styles.chatNoBorder}>
                        <Stack direction='horizontal' style={{ justifyContent: "space-between" }}>
                            <div>
                                <Card.Title className={styles.chatBold}>{group.name}</Card.Title>
                                <Card.Subtitle>
                                    Created by {group.created_by.name}.
                                </Card.Subtitle>
                            </div>
                            <Button onClick={scrollToBottom} style={{ backgroundColor: "transparent", borderColor: "transparent" }}><FaArrowAltCircleDown size={25} color='#27005d' /></Button>
                        </Stack>
                    </Card.Header>
                    <Card.Body className={styles.chatScroll}>
                        {group.chats.length == 0 &&
                            <p style={{ textAlign: "center" }}>No conversations yet</p>
                        }
                        {group.chats.map((item, index) => {
                            return <Container key={index} fluid className='m-2' style={item.from.name == authDetails.auth.name ? { textAlign: "end" } : {}}>
                                <p className={styles.chatNoMargin}>{item.from.name}</p>
                                {item.typeOfFile == "text" &&
                                    <Chip label={item.message} style={{ backgroundColor: '#27005d', borderColor: "#27005d", color: "white" }} size='medium' />
                                }
                                {item.typeOfFile == "image" &&
                                    <img src={config.uploads + item.fileName} alt="Lamp" className={styles.chatImage} />
                                }
                                {item.typeOfFile !== "text" && item.typeOfFile !== "image" &&
                                    <a href={config.uploads + item.fileName} download>
                                        <Chip label={<FaFileDownload size={20} />} clickable={true} style={{ backgroundColor: '#27005d', borderColor: "#27005d", color: "white" }} size='medium' />
                                    </a>
                                }
                            </Container>
                        })}
                        <div ref={divRef} />
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
            </div>
        )
    }
    // If isReady is true and but group is undefined (means we didn't join this group) then we return this
    else if (isReady && !group) {
        return <Container className={styles.mainContainer} fluid>
            <div className={styles.mainHei90}>
                <Card className={styles.mainCard}>
                    <Button className={styles.mainBtn} onClick={() => { joinHandler() }}>
                        Join
                    </Button>
                    <h5>Please join group first</h5>
                </Card>
            </div>
        </Container>
    }
    // If data is still been processed, we show a spinner as to show its loading
    else {
        <Spinner />
    }

}
