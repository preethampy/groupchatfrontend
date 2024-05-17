import React from 'react'
import { Stack, Button, Modal, Form, Navbar, Container } from 'react-bootstrap'
import store from '../app/store'
import styles from ".././styles/cs.module.css"
import { useEffect, useState } from 'react'
import request from '../utils/request'
import toast from 'react-hot-toast'
import { socket } from '../Socketio'
import { addNewMessageToGroupData, setGroupsData, addNewGroupToMyGroupsData } from '../features/groupsSlice'
import { Link, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthDetails } from '../features/authSlice'

export default function Root() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authDetails = useSelector((state) => state.auth);

    const [show, setShow] = useState(false);
    const [groups, setGroups] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    /**
     * We will call fetchAndSetGroups() on first load of page
     */
    useEffect(() => {
        fetchAndSetGroups();
    }, []);

    /**
     * We will listen to socket events below and dispatch update actions based on event received
     */
    useEffect(() => {
        socket.on('message-received', (data) => {
            dispatch(addNewMessageToGroupData({ newMessage: data }));
        });

        socket.on("room-joined-new", (data) => {
            dispatch(addNewGroupToMyGroupsData({ newGroup: data }))
        });

        socket.on("wait",(data)=>{
            fetchAndSetGroups();
            alert(data.message);
        });

        socket.on("join-request-received",()=>{
            fetchAndSetGroups();

        });

        socket.on("join-request-approved",()=>{
            fetchAndSetGroups()
        });
    }, [socket])

    /**
     * This function will fetch all the groups existing in database along with groups that user who is sending the request has joined.
     * Then we will store all the groups in a state so we can use it to navigate betwen different groups.
     * We will also dispatch the data we get to update redux store state.
     * Finally we will emit "auto-join" event to make the socket(user) to join the room.
     * @returns {Boolean} true - if the request is successfull.
     * @returns {Error} err - if the request is not successfull.
     */

    function fetchAndSetGroups() {
        return new Promise((resolve, reject) => {
            request("post", "group/get")
                .then((resp) => {
                    setGroups(resp.data.groups);
                    dispatch(setGroupsData({ groups: resp.data.groups, myGroups: resp.data.myGroups, myPendingGroups:resp.data.myPendingGroups }));
                    resolve(true);

                })
                .catch((err) => {
                    console.log(err);
                    toast.error("Failed to fetch groups data!");
                    reject(err);
                });
            socket.emit("auto-join");
        });
    }

    /**
     * This function will emit a 'create room' event to backend and upon room creation we will update the existing groups list by calling fetchAndSetGroups() function.
     * @param {*} e - Has the event data and we use it to prevent page from reloading and to get value of groupName passed to from.
     */

    function groupSubmitHandler(e) {
        e.preventDefault();
        const groupName = e.target.groupName.value;
        socket.emit('create room', groupName);
        socket.on("room-created", (data) => {
            toast.success("Created new group successfully!")
            fetchAndSetGroups().then(() => { handleClose() }).catch((err) => { handleClose() })
        })
    }

    /**
     * Handles logout by removing user related details like JWT from localstorage and redux
     */
    function logoutHandler(){
        dispatch(setAuthDetails({ jwt: null, uid: null, name: null}));
            localStorage.removeItem("jwt");
            localStorage.removeItem("uid");
            localStorage.removeItem("name");
            navigate("");
    }

    return <>
        <Navbar className="bg-body-tertiary bg-lite">
            <Container fluid>
                <Navbar.Brand><Link style={{ textDecoration: "none", color: "black" }} to={`/chat`}>Groups</Link></Navbar.Brand>
                <Stack gap={"3"} direction='horizontal' className={styles.chatScroll}>
                    <p onClick={handleShow} className={styles.mainChip}>Create+</p>
                    {groups.map((item, index) => {
                        return <Link className={styles.mainChip} to={`/chat/${item._id}`} key={index}>{item.name}</Link>
                    })}
                </Stack>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Stack direction='horizontal' gap={"2"}>
                    <Navbar.Text>
                        {authDetails.name}
                    </Navbar.Text>
                    <Navbar.Text>
                        <Button onClick={logoutHandler} style={{ backgroundColor: "#27005d", borderColor: "#27005d" }} size='sm'>Logout</Button>
                    </Navbar.Text>
                    </Stack>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Outlet />
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
    </>
}
