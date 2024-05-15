import React from 'react'
import { Form, Button, Stack } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuthDetails } from "../features/authSlice";
import request from '../utils/request';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import styles from ".././styles/cs.module.css";

export default function AuthCard({type}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    function submitHandler(e) {
      e.preventDefault()
      const email = e.target.email.value;
      const name = e.target.name ? e.target.name.value:null;
      const password = e.target.password.value;
      request("post", 
      type == "login" ? "user/login/" : "user/register/", type == "login" ? 
      {
        "email": email,
        "password": password
      } : {
        "email": email,
        "name":name,
        "password": password
      }).then((resp) => {
        if(resp.data.jwt){
            dispatch(setAuthDetails({ jwt: resp.data.jwt }));
            localStorage.setItem("jwt", resp.data.jwt);
            localStorage.setItem("uid", resp.data.uid);
            localStorage.setItem("name", resp.data.name);
            navigate("/chat");
        }
        else{
            toast.success("Please login now!")
            navigate("/");
        }
      }).catch((err) => {
        console.log(err);
      })
    }
  return (
    <div className={styles.authDiv}>
        <Toaster/>
        <Stack className={`shadow-lg p-3 mb-5 rounded ${styles.authStack}`}>
          <h3 className={styles.authH3}>{type == "login" ? "Login" : "Signup"}</h3>
          <Form onSubmit={submitHandler}>
            {type == "signup" &&
            <Form.Group className="mb-3">
            <Form.Label className={styles.label}>Name</Form.Label>
            <Form.Control className='my-p' size="sm" type="text" name="name" placeholder="Enter name" />
          </Form.Group>
            }
            <Form.Group className="mb-3">
              <Form.Label className={styles.label}>Email</Form.Label>
              <Form.Control
              className='my-p' size="sm" type="email" name="email" placeholder="Enter email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.label}>Password</Form.Label>
              <Form.Control
              className='my-p' size="sm" type="password" name="password" placeholder="Password" />
            </Form.Group>
            <div className='text-center'>
              <Button size="sm" type="submit" className={styles.authBtn}>
                {type == "login" ? "Login" : "Signup"}
              </Button>
              </div>
              <div className='text-center mt-1'>
              <a href={type == "login" ? "/signup" : "/"} className={styles.authAnc}>{type == "login" ? "Signup" : "Login"}</a>
              </div>
          </Form>
        </Stack>
      </div>
  )
}
