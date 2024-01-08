const socketIO = require('socket.io');
const { Room } = require("./models/room.model")
const { Msg } = require("./models/msg.model")

let io;
async function checkIfRoomExists(id) {
    console.log({ id });
    const room = await Room.findOne({ id });
    return room;
}

async function getChatMessages(idRoom) {
    try {
        const messages = await Msg.find({ room: idRoom });
        console.log(messages);
        return messages;
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
    }
}


function initializeSocket(httpServer) {
    io = socketIO(httpServer, { cors: { origin: "*" } });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
        //פתיחת צ'אט חדש
        socket.on('openChat', async (data) => {
            // פתיחת צ'אט חדש
            //const { sender, receiver, project } = data;
            const { currentUser, receiver, selectedProject, idRoom } = data;

            let room = await checkIfRoomExists(idRoom);
            if (!room) {
                room = new Room({
                    id: idRoom,
                    users: [currentUser, receiver],
                    project: selectedProject,
                });
                try {
                    await room.save();
                    console.log('New chat room created:', room.id);
                } catch (error) {
                    console.error('Error creating chat room:', error);
                }
            }
            socket.join(room.id);//חיבור לחדר הנוכחי

            const messages = await getChatMessages(idRoom);
            socket.emit('chatHistory', { messages });

            console.log(`New chat room opened: ${room?.id}`);
        });


        socket.on('chat', (data) => {
            console.log('Received chat message:', data);
            // const {idRoom } = data;
            const { sender, receiver, message, idRoom } = data;
            console.log(data.idRoom);
            // יצירת אובייקט חדש מסוג Msg
            const newMsg = new Msg({
                sender: sender,
                receiver: receiver,
                content: message,
                room: idRoom
            });

            console.log(newMsg);
            // שמירת ההודעה בDB
            newMsg.save()
                .then(() => {
                    console.log('Message saved to DB:', newMsg);
                })
                .catch((error) => {
                    console.error('Error saving message to DB:', error);
                });

            // ניתן להוסיף פעולות טיפול נוספות כאן
/*             io.emit('newMessage', data);
 */            io.to(idRoom).emit('newMessage', data);
        });




        /*          socket.on('chat', (data) => {
                     // שליחת הודעה לצ'אט קיים
                     const { sender, receiver, project, message } = data;
                     const chatRoom = `${sender}_${receiver}_${project}`;
         
                     io.to(chatRoom).emit('newMessage', data);
                 }); */



        // socket.on('chat', (data) => {
        //     console.log('Received chat message:', data);
        //     // ניתן להוסיף פעולות טיפול נוספות כאן
        // });

        // פה תוכל להוסיף פונקציות נוספות שמטרתן לאזן לאירועי סוקט מצד הלקוח
    });
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }

    return io;
}

module.exports = { initializeSocket, getIO };


