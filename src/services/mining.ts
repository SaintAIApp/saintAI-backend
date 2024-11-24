import Minings from "../models/mining";

class MiningServices {
    async createOrUpdate(user_id:string,userMsg:string,timeTaken:number,assistantResponse:string){

        const newChat = {
            timeTaken,
            question: userMsg,
            answer: assistantResponse,
            created_at: new Date()
        };
        
        let tradeLog = await Minings.findOne({ user_id });
        const timeTakenInSeconds = timeTaken / 1000; // timeTaken dalam detik
        
        if (tradeLog) {
            tradeLog.clock += timeTakenInSeconds;  
            tradeLog.clock = parseFloat(tradeLog.clock.toFixed(2)); 
        
            while (tradeLog.clock >= 60) {
                tradeLog.coin_stt += 1.25;
                tradeLog.clock -= 60;
            }
        
            tradeLog.chats.push(newChat);
        } else {
            const clock = 0 + timeTakenInSeconds;
            tradeLog = await Minings.create({
                user_id,
                clock: parseFloat(clock.toFixed(2)),  
                coin_stt: 0,
                chats: [newChat]
            });
        
         
            if (tradeLog.clock >= 60) {
                tradeLog.coin_stt += 1.25;
                tradeLog.clock -= 60;
            }
        }
        
        await tradeLog.save();
    }

    async getMining(user_id: string) {
        const tradeLog = await Minings.findOne({ user_id });
        if (!tradeLog) {
            throw new Error('Mining log not found for the given user_id');
        }

        return tradeLog;
    }

}

export default new MiningServices();