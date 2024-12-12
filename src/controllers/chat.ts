import { Server, Socket } from 'socket.io';
import { ChatCommunity } from '../models/chatCommunity';
import User from '../models/user';

export const chatSocket = (io: Server) => {
  const onlineUsers = new Set<string>();
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('userConnected', (userId: string) => {
      onlineUsers.add(userId);
      io.emit('onlineUsers', Array.from(onlineUsers)); 
      console.log('Online users:', Array.from(onlineUsers));
    });

    // Handle user disconnection
    const handleDisconnect = (userId: string) => {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers)); 
      console.log('User disconnected:', socket.id);
    };

    socket.on('disconnect', () => {
      const userId = Array.from(onlineUsers).find(id => socket.id === id);
      if (userId) handleDisconnect(userId);
    });

    socket.on('userDisconnected', handleDisconnect);
    
    socket.on('joinGroup', (groupId: string) => {
      socket.join(groupId);
      console.log(`User joined group: ${groupId}`);
    });

    
    socket.on('typing', (data) => {
      const { userId, groupId, username } = data;
      
      socket.to(groupId).emit('typing', { userId, username });
    });

    
    socket.on('stopTyping', (data) => {
      const { userId, groupId } = data;
      
      socket.to(groupId).emit('stopTyping', { userId });
    });

    
    socket.on('sendMessage', async ({ content, sender, senderName, groupId }, callback) => {
      const newMessage = await ChatCommunity.create({
        content,
        sender,
        senderName,
        groupId,
        readBy: [],
        timestamp: new Date(),
      });
    
      io.to(groupId).emit('newMessage', newMessage);
      if (callback) callback(); // Send acknowledgment back to the client
    });
    
    
    socket.on('readMessage', async ({ messageId, userId }) => {
      const user = await User.findById(userId);
      if (!user) {
        console.error("User not found");
        return;
      }
      
      const updatedMessage = await ChatCommunity.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } }, 
        { new: true }
      );
      
      io.emit('messageRead', { messageId, userId, username: user.username, updatedMessage });
    });

    socket.on('getMessages', async (groupId: string, callback: Function) => {
      try {

        const messages = await ChatCommunity.find({ groupId }).sort({ timestamp: 1 });

        
        const messagesWithReadByUsername = await Promise.all(messages.map(async (message) => {
          const updatedReadBy = await Promise.all(
            message.readBy.map(async (read) => {
              const user = await User.findById(read);
              return { userId: read, username: user?.username || 'Unknown' }; 
            })
          );
          
          return {
            ...message.toObject(),
            readByUser: updatedReadBy, 
          };
        }));

        
        callback(messagesWithReadByUsername);
      } catch (error) {
        console.error('Error fetching messages:', error);
        callback([]);
      }
    });
  });
};
