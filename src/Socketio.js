import { io } from "socket.io-client";

/**
 * Initializing sockets, attaching JWT token, username to every ping that happens with backendserver and exporting the socket so
 * we can use anywhere in project. 
 */

export const socket = io("http://127.0.0.1:4001",{
    auth: async (cb) => {
      const tkn = localStorage.getItem("jwt");
      const name = localStorage.getItem("name");
        cb({ token: tkn, name:name });
    }});