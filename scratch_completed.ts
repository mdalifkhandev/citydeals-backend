import { Queue } from 'bullmq';

async function check() {
  const queue = new Queue('proximity-notifications', { connection: { host: 'localhost', port: 6379 } });
  
  const completedJobs = await queue.getCompleted(0, 10);
  for (const job of completedJobs) {
    console.log(`Completed Job ${job.id} (${job.name}):`, job.returnvalue);
  }
}

check().catch(console.error).finally(() => process.exit(0));
