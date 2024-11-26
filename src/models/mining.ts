import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    timeTaken: { type: Number, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const miningSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    clock: { type: Number, required: true },  
    mining_duration: { type: Number, required: true },
    max_mining_duration: { type: Number, required:true},
    coin_stt: { type: Number, required: true },
    total_mining_duration: { type: Number, required: true },
    chats: [chatSchema],  
    last_mining_date: { type: Date }, 
    created_at: { type: Date, default: Date.now }
});

const Minings = mongoose.model('minings', miningSchema);

export default Minings;