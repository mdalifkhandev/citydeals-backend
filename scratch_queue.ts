import { Queue } from 'bullmq';

async function check() {
  const queue = new Queue('proximity-notifications', { connection: { host: 'localhost', port: 6379 } });
  
  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();
  const failed = await queue.getFailedCount();
  const delayed = await queue.getDelayedCount();
  
  console.log(`Queue Stats: Waiting=${waiting}, Active=${active}, Failed=${failed}, Delayed=${delayed}`);
  
  if (failed > 0) {
    const failedJobs = await queue.getFailed(0, 10);
    for (const job of failedJobs) {
      console.log(`Failed Job ${job.id} (${job.name}):`, job.failedReason);
    }
  }
}

check().catch(console.error).finally(() => process.exit(0));
