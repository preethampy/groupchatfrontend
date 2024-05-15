import { io } from "socket.io-client";

export const socket = io("http://127.0.0.1:4001",{
    auth: async (cb) => {
      const tkn = localStorage.getItem("jwt");
      const name = localStorage.getItem("name");
        cb({ token: tkn, name:name });
    }});