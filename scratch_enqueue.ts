import { config } from 'dotenv';
config();
import { Queue } from 'bullmq';

async function check() {
  const queue = new Queue('proximity-notifications', { connection: { host: 'localhost', port: 6379 } });
  
  const job = await queue.add('send-grouped-proximity', { 
    userId: 'cmupd9fx30000n4w2tj87w7je', 
    merchantIds: ['ef0db9c3-8aab-4135-8275-10806691c47c'], 
    totalCoupons: 1 
  });
  console.log('Added job:', job.id);
}

check().catch(console.error).finally(() => process.exit(0));
