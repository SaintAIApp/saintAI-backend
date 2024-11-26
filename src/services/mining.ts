import Minings from "../models/mining";
import PaymentDetails from "../models/paymentDetails";
interface Mining extends Document {
    user_id: string;
    clock: number;
    max_mining_duration: number;
    total_mining_duration: number;
    mining_duration: number;
    coin_stt: number;
    last_mining_date: Date | null;
    created_at: Date;
}

class MiningServices {
    async createOrUpdate(
        user_id: string,
        userMsg: string,
        timeTaken: number,
        assistantResponse: string
    ): Promise<void> {
        const newChat = {
            timeTaken,
            question: userMsg,
            answer: assistantResponse,
            created_at: new Date()
        };
        let totalMiningDuration = await this.getTotalMiningDuration()
        let tradeLog = await Minings.findOne({ user_id });
        let plan = await PaymentDetails.findOne({ userId:user_id });
        let max_mining_duration: number;

        if (plan?.plan === "pro") {
            max_mining_duration = 4 * 60; // minutes
        } else if (plan?.plan === "proPlus") {
            max_mining_duration = 24 * 60; // minutes
        } else {
            max_mining_duration = 2 * 60; // minutes
        }
        const timeTakenInSeconds = timeTaken / 1000;
        const timeTakenInMinutes = timeTakenInSeconds / 60;

        const today = new Date();
        const todayDate = today.toISOString().split('T')[0]; 

        if (tradeLog) {
            
            if (tradeLog?.last_mining_date?.toISOString().split('T')[0] !== todayDate) {
                tradeLog.mining_duration = 0;
                tradeLog.last_mining_date = today;
            }
            if(totalMiningDuration >= 1000) {
                tradeLog.coin_stt += 100;
            }
            
            if (tradeLog.mining_duration + timeTakenInMinutes <= max_mining_duration) {
                tradeLog.clock += timeTakenInSeconds;  
                tradeLog.clock = parseFloat(tradeLog.clock.toFixed(2)); 
                
                
                while (tradeLog.clock >= 60) {
                    tradeLog.coin_stt += 1.25;
                    max_mining_duration -= 1 ;
                    tradeLog.mining_duration += 1;
                    tradeLog.total_mining_duration += 1;
                    tradeLog.clock -= 60;
                }
                tradeLog.chats.push(newChat);
            } else {
                console.log("Mining limit reached for today");
            }
        } else {
            const clock = 0 + timeTakenInSeconds;
            tradeLog = await Minings.create({
                user_id,
                clock: parseFloat(clock.toFixed(2)),  
                coin_stt: 0,
                mining_duration: 0,
                total_mining_duration:0,
                max_mining_duration:max_mining_duration,
                last_mining_date: todayDate,
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
        let tradeLog = await Minings.findOne({ user_id }) as Mining | null;
        let plan = await PaymentDetails.findOne({ userId:user_id });
        let max_mining_duration: number;

        if (plan?.plan === "pro") {
            max_mining_duration = 4 * 60; // minutes
        } else if (plan?.plan === "proPlus") {
            max_mining_duration = 24 * 60; // minutes
        } else {
            max_mining_duration = 2 * 60; // minutes
        }
        if (!tradeLog) {
            tradeLog = {
                clock: 0,
                mining_duration: 0,
                max_mining_duration:max_mining_duration,
                total_mining_duration:0,
                coin_stt: 0,
                last_mining_date: null,
                created_at: new Date()
            } as Mining;
        }

        return tradeLog;
    }
    async getTotalMiningDuration(): Promise<number> {
        const result = await Minings.aggregate([
            {
                $group: {
                    _id: null,
                    totalMiningDuration: { $sum: "$mining_duration" }
                }
            }
        ]);

        return result[0]?.totalMiningDuration || 0;
    }
}

export default new MiningServices();