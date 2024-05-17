import React, { useEffect, useRef } from 'react'
import { Container, Stack, Card, Form, Button, Spinner, Modal } from 'react-bootstrap'
import { IoSend } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
import { BiSolidMessageDots } from "react-icons/bi";
import { FaFileDownload } from "react-icons/fa";
import store from '../app/store';
import { Chip } from '@mui/material';
import config from '../config';
import { FaArrowAltCircleDown } from "react-icons/fa";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useState } from 'react';
import { socket } from '../Socketio';
import toast, { Toaster } from 'react-hot-toast';
import styles from ".././styles/cs.module.css";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ChatBodyMod() {

    const wholeUrl = useLocation();
    const id = wholeUrl.pathname.split("/").pop();

    const authDetails = store.getState();
    const state = useSelector((state) => state.groups);

    const [group, setGroup] = useState();
    const [pending, setPending] = useState();
    const [isReady, setIsReady] = useState();
    const [fileToSend, setFileToSend] = useState(null);
    const [showFileInput, setShowFileInput] = useState(false);
    const [myMessage, setMyMessage] = useState("");
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const fileRef = useRef(null)
    const divRef = useRef(null)

    /**
     * This function will get current state data of myGroups from redux store's groups reducer.
     * Then we will find the group based on param called id of current page that is fetched from current url.
     * We will finally set the current group state to the group we found.
     */

    function commonFunc() {
        const myGroups = store.getState().groups.myGroups;
        const myPendingGroups = store.getState().groups.myPendingGroups;
        const group = myGroups.find((obj) => obj._id === id);
        const pendingGroup = myPendingGroups.find((obj) => obj._id === id);

        setPending(pendingGroup);
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

    function acceptHandler(id) {
        socket.emit("approve-join", {
            groupId: group._id,
            userId: id
        });
        handleClose();
    }

    // If isReady is true and group is not undefined (means we already joined this group) then we return this
    if (isReady && group) {
        return (
            <div className={styles.mainHei90}>
                <Toaster />
                <Card className={styles.chatCard}>
                    <Card.Header className={styles.chatNoBorder}>
                        <Stack direction='horizontal' style={{ justifyContent: "space-between" }}>
                            <div>
                                <Card.Title className={styles.chatBold}>{group.name}</Card.Title>
                                <Card.Subtitle>
                                    Created by {group.created_by.name}.
                                </Card.Subtitle>
                            </div>
                            <div>
                                {authDetails.auth.name == group.created_by.name &&
                                    <Button onClick={handleShow} style={{ backgroundColor: "transparent", borderColor: "transparent" }}><IoPersonAddSharp size={22} color='#27005d' /></Button>
                                }
                                <Button onClick={scrollToBottom} style={{ backgroundColor: "transparent", borderColor: "transparent" }}><FaArrowAltCircleDown size={25} color='#27005d' /></Button>
                            </div>
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

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Join Requests</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='m-auto'>
                        {
                            group.requests.length == 0 &&

                            <p>No join requests</p>
                        }
                        {group.requests.map((item, index) => {
                            return <p>
                                <Stack gap={"3"} direction='horizontal'>
                                    <div><span style={{ fontWeight: "bold" }}>{item.name}</span> wants to joint this group. </div>
                                    <FaCheck style={{ cursor: "pointer", color: "#27005d" }} onClick={() => { acceptHandler(item._id) }} size={20} />
                                    <ImCross style={{ cursor: "pointer", color: "#27005d" }} onClick={handleClose} size={18} />
                                </Stack>
                            </p>
                        })}

                    </Modal.Body>
                </Modal>
            </div>
        )
    }
    // If isReady is true and but group is undefined (means we didn't join this group) then we return this
    else if (isReady && !group && !pending) {
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
    else if (isReady && pending) {
        return <Container className={styles.mainContainer} fluid>
            <div className={styles.mainHei90}>
                <Card className={styles.mainCard}>
                    <h5>Request pending! Please wait till owner of this group accepts your request.</h5>
                </Card>
            </div>
        </Container>
    }
    // If data is still been processed, we show a spinner as to show its loading
    else {
        <Spinner />
    }

}
