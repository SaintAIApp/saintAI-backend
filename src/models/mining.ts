import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    timeTaken: { type: Number, required: true }, // waktu eksekusi dalam milidetik
    question: { type: String, required: true },
    answer: { type: String, required: true },
    created_at: { type: Date, default: Date.now } // waktu pembuatan chat
});

const miningSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    clock: { type: Number, required: true },  // misalnya untuk menyimpan waktu yang berkaitan
    coin_stt: { type: Number, required: true },
    chats: [chatSchema],  // array objek chat
    created_at: { type: Date, default: Date.now }
});

const Minings = mongoose.model('minings', miningSchema);

export default Minings;