import mongoose from 'mongoose';

const ChatCommunitySchema = new mongoose.Schema({
  groupId: { type: String, required: true },   
  content: { type: String, required: true },   
  sender: { type: String, required: true },    
  senderName: {type : String,required:true},
  timestamp: { type: Date, default: Date.now }, 
  readBy: { type: [String], default: [] }      
});

export const ChatCommunity = mongoose.model('ChatCommunities', ChatCommunitySchema);
