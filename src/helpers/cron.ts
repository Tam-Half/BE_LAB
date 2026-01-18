import { CronJob } from 'cron';
import { AppDataSource } from '../data-source';
import { Booking } from '../dto/Booking';
import { LessThanOrEqual } from 'typeorm';

export const initCron = () => {
  const job = new CronJob('*/15 * * * *', async () => {
    console.log('[CRON] Running expired booking check...');
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const result = await bookingRepository.update(
        {
          status: 'PENDING',
          expires_at: LessThanOrEqual(new Date())
        },
        {
          status: 'EXPIRED'
        }
      );
      console.log(`[CRON] Expired booking check completed. Updated ${result.affected} bookings.`);
    } catch (error) {
      console.error('[CRON] Error during expired booking check:', error);
    }
  });

  job.start();
};
