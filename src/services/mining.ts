import Minings from "../models/mining";
import PaymentDetails from "../models/paymentDetails";
import Plans from "../models/plans";
import User from "../models/user";
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

interface IChat {
    timeTaken: number;
    question: string;
    answer: string;
    created_at: Date;
}

class MiningServices {
    private readonly MINING_DURATIONS = {
        pro: 4 * 60,
        proPlus: 24 * 60,
        default: 2 * 60
    };

    private readonly COIN_REWARD = 1.25;
    private readonly MINING_INTERVAL = 60; // 1 minute in seconds
    private readonly SPECIAL_MINING_HOURS = 1000;
    private readonly SPECIAL_MINING_REWARD = 100;

    async createOrUpdate(
        user_id: string,
        userMsg: string,
        timeTaken: number,
        assistantResponse: string
    ): Promise<void> {
        try {
            const timeTakenInSeconds = this.calculateTimeTaken(timeTaken, assistantResponse);
            const newChat = this.createChatObject(userMsg, timeTaken, assistantResponse);
            
            const plan = await PaymentDetails.findOne({ userId: user_id });
            const max_mining_duration = this.getMiningDuration(plan?.plan);

            let tradeLog = await Minings.findOne({ user_id });
            const today = new Date();

            if (!tradeLog) {
                tradeLog = await this.createNewTradeLog(user_id, timeTakenInSeconds, max_mining_duration, newChat);
                await this.processClockAndRewards(tradeLog, today);
                await tradeLog.save();
                return;
            }

            await this.updateExistingTradeLog(tradeLog, today, max_mining_duration, timeTakenInSeconds, newChat);
        } catch (error) {
            console.error('Error in createOrUpdate:', error);
            throw error;
        }
    }

    private calculateTimeTaken(timeTaken: number, assistantResponse: string): number {
        return assistantResponse === "this game" ? timeTaken : timeTaken / 1000;
    }

    private createChatObject(userMsg: string, timeTaken: number, assistantResponse: string): IChat {
        return {
            timeTaken,
            question: userMsg,
            answer: assistantResponse,
            created_at: new Date()
        };
    }

    private getMiningDuration(plan?: string): number {
        return this.MINING_DURATIONS[plan as keyof typeof this.MINING_DURATIONS] || this.MINING_DURATIONS.default;
    }

    private async createNewTradeLog(
        user_id: string,
        timeTakenInSeconds: number,
        max_mining_duration: number,
        newChat: IChat
    ) {
        return await Minings.create({
            user_id,
            clock: parseFloat(timeTakenInSeconds.toFixed(2)),
            coin_stt: 0,
            total_mining_duration: 0,
            max_mining_duration,
            last_mining_date: null,
            chats: [newChat]
        });
    }

    private async updateExistingTradeLog(
        tradeLog: any,
        today: Date,
        max_mining_duration: number,
        timeTakenInSeconds: number,
        newChat: IChat
    ): Promise<void> {
        const todayDate = today.toISOString().split('T')[0];
        const lastMiningDate = tradeLog.last_mining_date?.toISOString().split('T')[0];

        if (lastMiningDate !== todayDate) {
            tradeLog.max_mining_duration = max_mining_duration;
            tradeLog.last_mining_date = today;
        }

        if (tradeLog.max_mining_duration <= 0) {
            return; // Mining limit reached
        }

        await this.processSpecialMiningReward(tradeLog);

        tradeLog.clock = parseFloat((tradeLog.clock + timeTakenInSeconds).toFixed(2));
        tradeLog.chats.push(newChat);

        await this.processClockAndRewards(tradeLog, today);
        await tradeLog.save();
    }

    private async processSpecialMiningReward(tradeLog: any): Promise<void> {
        const totalMiningDuration = await this.getTotalMiningDuration();
        const totalMiningDurationInHours = totalMiningDuration / 60;

        if (totalMiningDurationInHours === this.SPECIAL_MINING_HOURS) {
            tradeLog.total_mining_duration += 1;
            tradeLog.coin_stt += this.SPECIAL_MINING_REWARD;
        }
    }

    private async processClockAndRewards(tradeLog: any, today: Date): Promise<void> {
        while (tradeLog.clock >= this.MINING_INTERVAL) {
            tradeLog.coin_stt += this.COIN_REWARD;
            tradeLog.max_mining_duration -= 1;
            tradeLog.total_mining_duration += 1;
            tradeLog.clock -= this.MINING_INTERVAL;
            tradeLog.last_mining_date = today;
        }
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
                mining_duration: max_mining_duration,
                max_mining_duration: max_mining_duration,
                total_mining_duration: 0,
                coin_stt: 0,
                last_mining_date: new Date(),
                created_at: new Date()
            } as Mining;
        } else {
            const today = new Date();
            const lastMiningDate = tradeLog.last_mining_date ? new Date(tradeLog.last_mining_date) : null;
            const todayDate = today.toISOString().split('T')[0];
            const lastMiningDateString = lastMiningDate ? lastMiningDate.toISOString().split('T')[0] : null;
    
            if (todayDate !== lastMiningDateString) {
                tradeLog.max_mining_duration = max_mining_duration;
                tradeLog.last_mining_date = today;
                
                await Minings.updateOne({ user_id }, { $set: tradeLog });
            }
        }

        return tradeLog;
    }
    async getMiningData() {
        try {
          const miningData = await Minings.find().select(['coin_stt','user_id']).lean();
          const userIds = miningData.map(m => m.user_id);
          
          const users = await User.find({ _id: { $in: userIds } }).lean();
          const userMap = new Map(users.map(u => [u._id.toString(), { planId: u.planId, name: u.username }]));
          
          const planIds = Array.from(new Set(users.map(u => u.planId)));
          const plans = await Plans.find({ _id: { $in: planIds } }).lean();
          const planMap = new Map(plans.map(p => [p._id.toString(), p.tier]));
          
         
          const groupedData = new Map<number, any[]>([
            [5, []],
            [4, []],
            [3, []],
            [2, []],
            [1, []]
          ]);
          
          miningData.forEach(mining => {
            const userInfo = userMap.get(mining.user_id.toString());
            if (userInfo?.planId) {
              const tier = planMap.get(userInfo.planId.toString());
              if (tier !== undefined && groupedData.has(tier)) {
                groupedData.get(tier)?.push({ ...mining, name: userInfo.name });
              }
            }
          });
          
          // Sort each tier by amount (desc) and limit to 5
          groupedData.forEach((value, key) => {
            value.sort((a, b) => b.amount - a.amount);
            groupedData.set(key, value.slice(0, 5));
          });
          
          return Object.fromEntries([...groupedData.entries()].sort(([a], [b]) => a - b));
        } catch (error) {
          console.error('Error fetching mining data:', error);
          return {};
        }
      }
    async getTotalMiningDuration(): Promise<number> {
        const result = await Minings.aggregate([
            {
                $group: {
                    _id: null,
                    totalMiningDuration: { $sum: "$total_mining_duration" }
                }
            }
        ]);

        return result[0]?.totalMiningDuration || 0;
    }
    
}

export default new MiningServices();