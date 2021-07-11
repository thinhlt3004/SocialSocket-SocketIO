//import socket.io with PORT 8900
const io = require('socket.io')(8989,{
    cors:{
        origin:"http://localhost:3000"
    }
});

let users = [];
const addUser = (userId, socketId) => {
    //If users arr không chứa userId gửi từ client thì push cái userId và socketId vào users Arr
    !users.some(user => user.userId === userId) && users.push({userId, socketId});
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
}
//Connect
io.on("connection", (socket) => {
    console.log(`${users.length} user connected`);
    //si socketId
    console.log(JSON.stringify(users));
    //take userId and socketId from Client to users ARR
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);

        //Check user nào đang online thì nó sẽ tạo sẽ chứa trong users arr
        io.emit("getUsers", users)
    });
    socket.on("sendNewConversation", ({conversation}) => {
        const user = getUser(conversation.member[1]);
        // console.log(user);
        // console.log(user.socketId);
        // console.log(conversation);
        io.emit("getNewConversationsforReceive",{
            conversation:conversation
        })
    });
    //Get info of Message Home
    socket.on("SendNewMessageHome", (data)=> {
            try{
                console.log(data);
                 console.log(data.senderId);
                const receiveId = data.receiveId;
                const user = getUser(receiveId);
                //console.log(user);
                io.emit("getNewConversationsforReceiveHome",{
                    currentChat: data.currentChat,
                    senderId:data.senderId,
                    text: data.text,
                    receiveId: receiveId
                })  
            }catch(e){
                console.log(e.message);
            }
        //console.log(users);
       // const user = getUser(data.receiveId);
      //  console.log(user);
    });
    socket.on("SendnewComment", (data) =>{
        console.log(data);
        if(data.isLiked !== null){
            if(data.notification !== null){
                io.emit("CallbackMessagetoAllClient", {
                    senderId: data.senderId,       
                    postId: data.postId,
                    comments: data.comments,
                    content: data.content,
                    notification: data.notification,
                    isLiked: data.isLiked
                })
            }else{
                io.emit("CallbackMessagetoAllClient", {
                    senderId: data.senderId,       
                    postId: data.postId,
                    comments: data.comments,
                    content: data.content,                  
                    isLiked: data.isLiked
                })
            }
        }else{
            io.emit("CallbackMessagetoAllClient", {
                senderId: data.senderId,       
                postId: data.postId,
                comments: data.comments,
                content: data.content,
                notification: data.notification
            })
        }
    })

    //Send Friend Request
    socket.on("SendFriendRequest", (data) => {
        console.log(data);
        // console.log(receiverId);
            try {
                const receiverId = data.request.receiverId;
                const user = getUser(receiverId);
                //console.log(user);
                if(user){
                    const requestFriend = {
                        _id: data.request._id,
                        senderId:data.request.senderId,
                        receiverId: data.request.receiverId,
                        createdAt: data.request.createdAt,
                        status: data.status
                    }
                    // console.log(user.socketId);
                    // console.log(requestFriend)
                    io.emit("SendRequestFriendCallback", requestFriend);
                }
            } catch (error) {
               console.log(error); 
            }
    })

    socket.on("AcceptOrCancel", (data) => {
        try {
            const requestFriend = {
                _id: data.request._id,
                senderId:data.request.senderId,
                receiverId: data.request.receiverId,
                createdAt: data.request.createdAt,
                status: data.status
            }
            //console.log(requestFriend);
            io.emit("SendCallBackAcceptOrCancel", requestFriend);
        } catch (error) {
            console.log(error);
        }
    })

    socket.on("SendingMessage", (data) => {
        console.log(data);
    })

    //Disconnect khi socket.id bị ngắt
    socket.on("disconnect", () => {
        console.log('Sombody disconnected')
        removeUser(socket.id);
        io.emit("getUsers", users)
    });
});