import { Server, Socket } from 'socket.io';
import { ChatCommunity } from '../models/chatCommunity';
import User from '../models/user';

export const chatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join group
    socket.on('joinGroup', (groupId: string) => {
      socket.join(groupId);
      console.log(`User joined group: ${groupId}`);
    });

    socket.on('typing', (data) => {
        const { userId, groupId } = data;
        // Kirimkan event 'typing' ke semua anggota grup yang sedang online, kecuali pengirim
        socket.to(groupId).emit('typing', { userId });
      });
    
      // Mendengarkan event 'stopTyping' ketika user berhenti mengetik
      socket.on('stopTyping', (data) => {
        const { userId, groupId } = data;
        // Kirimkan event 'stopTyping' ke semua anggota grup yang sedang online, kecuali pengirim
        socket.to(groupId).emit('stopTyping', { userId });
      });
    // Send message
    socket.on('sendMessage', async ({ content, sender, senderName, groupId }) => {
      const newMessage = await ChatCommunity.create({
        content,
        sender,
        senderName,
        groupId,
        readBy: [], 
        timestamp: new Date(),
      });
      io.to(groupId).emit('newMessage', newMessage);
    });

    // Mark message as read
    socket.on('readMessage', async ({ messageId, userId }) => {
        
        const user = await User.findById(userId);
        
        if (!user) {
          console.error("User not found");
          return;
        }
      
        // Update message dan tambahkan user ke array readBy
        const updatedMessage = await ChatCommunity.findByIdAndUpdate(
          messageId,
          { $addToSet: { readBy: userId } }, // Add user to the readBy array
          { new: true }
        );
      
        // Emit event dengan username tambahan
        io.emit('messageRead', { messageId, userId, username: user.username, updatedMessage });
      });
    // Get messages from a group
    socket.on('getMessages', async (groupId: string, callback: Function) => {
        try {
          // Ambil pesan berdasarkan groupId dan urutkan berdasarkan timestamp
          const messages = await ChatCommunity.find({ groupId }).sort({ timestamp: 1 });
      
          // Loop melalui pesan dan ambil username untuk setiap user yang ada di readBy
          const messagesWithReadByUsername = await Promise.all(messages.map(async (message) => {
            // Ambil user yang ada di dalam readBy array, dan cari username mereka
            const updatedReadBy = await Promise.all(
              message.readBy.map(async (read) => {
                const user = await User.findById(read);
                return { userId: read, username: user?.username || 'Unknown' }; // Menambahkan username
              })
            );
      
            // Return pesan dengan tambahan readByUsername
            return {
              ...message.toObject(),
              readByUser: updatedReadBy, // update readBy dengan userId dan username
            };
          }));
      
          // Kirim pesan yang sudah diperbarui ke client
          callback(messagesWithReadByUsername);
        } catch (error) {
          console.error('Error fetching messages:', error);
          callback([]);
        }
      });
  });
};
