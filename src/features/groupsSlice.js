import { createSlice } from "@reduxjs/toolkit";

export const groupsSlice = createSlice({
    name: "groups",
    initialState: {
        groups: [],
        myGroups: [],
        myPendingGroups: []
    },
    reducers: {
        setGroupsData: (state, action) => {
            state.groups = action.payload.groups;
            state.myGroups = action.payload.myGroups;
            state.myPendingGroups = action.payload.myPendingGroups;
        },
        addNewMessageToGroupData:(state,action) => {
            state.myGroups = state.myGroups.map((gr, index) => {
                if (gr.name == action.payload.newMessage.to) {
                    gr.chats.push(action.payload.newMessage)
                    return gr
                }
                else {
                    return gr
                }
            });
        },
        addNewGroupToMyGroupsData:(state,action) => {
            state.myGroups = [...state.myGroups,action.payload.newGroup]
        },
    }
})

export const { setGroupsData,addNewMessageToGroupData,addNewGroupToMyGroupsData } = groupsSlice.actions;

export default groupsSlice.reducer;