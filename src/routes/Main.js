import React, { useEffect, useRef } from 'react'
import { Container, Stack, Card, Form, Button, Modal } from 'react-bootstrap'
import { useState } from 'react';
import request from '../utils/request';
import toast, { Toaster } from 'react-hot-toast';
import store from '../app/store';
import { socket } from '../Socketio';
import ChatBody from '../components/ChatBody';
import styles from ".././styles/cs.module.css";

export default function Main() {
    const [show, setShow] = useState(false);
    const [groups, setGroups] = useState([]);
    const myGroupsRef = useRef([]);
    const [myGroups, setMyGroups] = useState(myGroupsRef.current);
    const selectedGroupRef = useRef({ group: null, chats: [], joined: false })
    const [selectedGroup, setSelectedGroup] = useState(selectedGroupRef.current);
    const authDetails = store.getState()

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        fetchAndSetGroups();
    }, []);

    useEffect(() => {
        socket.on('message-received', (data) => {
            myGroupsRef.current = myGroupsRef.current.map((gr, index) => {
                if (gr.name == data.to) {
                    gr.chats.push(data)
                    return gr
                }
                else {
                    return gr
                }
            });
            setMyGroups(myGroupsRef.current);
        });
    }, [socket])

    function fetchAndSetGroups() {
        return new Promise((resolve, reject) => {
            request("post", "group/get")
                .then((resp) => {
                    setGroups(resp.data.groups);

                    myGroupsRef.current = resp.data.myGroups;
                    setMyGroups(myGroupsRef.current);

                    resolve(true)

                })
                .catch((err) => {
                    console.log(err);
                    toast.error("Failed to fetch groups data!");
                    reject(err);
                })
        });

    }

    function groupSubmitHandler(e) {
        e.preventDefault();
        const groupName = e.target.groupName.value;
        socket.emit('create room', groupName);
        socket.on("room-created", (data) => {
            toast.success("Created new group successfully!")
            fetchAndSetGroups().then(() => { handleClose() }).catch((err) => { handleClose() })
        })
    }

    function handleGroupSelection(group) {
        const index = myGroupsRef.current.findIndex((fg) => fg._id === group._id);

        if (index !== -1) {
            selectedGroupRef.current = { group: myGroupsRef.current[index], chats: myGroupsRef.current[index].chats, joined: true }
            setSelectedGroup(selectedGroupRef.current);
            socket.emit("join room", {
                groupId: myGroupsRef.current[index]._id,
                groupName: myGroupsRef.current[index].name
            });
        }
        else {
            selectedGroupRef.current = { group: group, chats: [], joined: false }
            setSelectedGroup({ group: group, chats: [], joined: false });
        }
    }

    function joinHandler(group) {
        socket.emit("join room", {
            groupId: group._id,
            groupName: group.name
        });

        socket.on("room-joined-new", (data) => {
            fetchAndSetGroups().then(() => { handleGroupSelection(group) });
        })

    }

    return (
        <Container className={styles.mainContainer} fluid>
            <Toaster />
            <Stack direction='horizontal' className={styles.mainStack}>
                <Stack gap={"4"} direction='horizontal' className={styles.chatScroll}>
                    <h5>Groups </h5>
                    <Stack gap={"4"} direction='horizontal'>
                        <p onClick={handleShow} className={styles.mainChip}>Create+</p>
                        {groups.map((item, index) => {
                            return <p key={index} onClick={() => { handleGroupSelection(item) }} className={styles.mainChip}>{item.name}</p>
                        })}
                    </Stack>
                </Stack>
                <div className={styles.mainWidthAuto}>
                    <p className={styles.mainTextEnd}>{authDetails.auth.name}</p>
                </div>
            </Stack>
            <div className={styles.mainHei90}>
                {selectedGroup.joined &&
                    <ChatBody group={selectedGroupRef.current} />
                }
                {!selectedGroup.joined &&
                    <Card className={styles.mainCard}>
                        {selectedGroup.group &&
                            <>
                                <Button className={styles.mainBtn} onClick={() => { joinHandler(selectedGroup.group) }}>
                                    Join
                                </Button>
                                <h5>Please join group first</h5>
                            </>
                        }

                        {!selectedGroup.group &&
                            <h5>Select or create a group to start group chat</h5>
                        }
                    </Card>
                }

                <>
                    <Modal show={show} onHide={handleClose}>
                        <Form onSubmit={groupSubmitHandler}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create Group</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <Form.Group className="mb-3" >
                                    <Form.Control name='groupName' type="text" placeholder="Enter a name for your group" />
                                </Form.Group>

                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button style={{ backgroundColor: "#27005d", borderColor: "#27005d" }} type='submit'>
                                    Save
                                </Button>

                            </Modal.Footer>
                        </Form>
                    </Modal>
                </>
            </div>
        </Container>
    )
}
