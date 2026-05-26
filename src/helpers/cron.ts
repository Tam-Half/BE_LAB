import { CronJob } from 'cron';
import { AppDataSource } from '../data-source';
import { Booking } from '../dto/Booking';
import { BookingRoomAllocation } from '../dto/BookingRoomAllocation';
import { BookingStatus, BookingRoomAllocationStatus } from '../dto/Enums';
import { LessThanOrEqual, Between } from 'typeorm';

export const initCron = () => {
  const job = new CronJob('*/15 * * * *', async () => {
    console.log('[CRON] Running expired booking check...');
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const result = await bookingRepository.update(
        {
          status: BookingStatus.PENDING,
          expires_at: LessThanOrEqual(new Date())
        },
        {
          status: BookingStatus.EXPIRED
        }
      );
      console.log(`[CRON] Expired booking check completed. Updated ${result.affected} bookings.`);
    } catch (error) {
      console.error('[CRON] Error during expired booking check:', error);
    }
  });

  job.start();

  // const checkInJob = new CronJob('0 9 * * *', async () => {
  //   console.log('[CRON] Running auto check-in job...');
  //   try {
  //     await AppDataSource.transaction(async (manager) => {
  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);
  //       const tomorrow = new Date(today);
  //       tomorrow.setDate(tomorrow.getDate() + 1);

  //       const bookingsToCheckIn = await manager.find(Booking, {
  //         where: {
  //           status: BookingStatus.CONFIRMED,
  //           check_in_date: Between(today, tomorrow)
  //         },
  //         relations: ['bookingRooms', 'bookingRooms.allocation']
  //       });

  //       if (bookingsToCheckIn.length === 0) {
  //         console.log('[CRON] No bookings found for auto check-in today.');
  //         return;
  //       }

  //       for (const booking of bookingsToCheckIn) {
  //         booking.status = BookingStatus.CHECKED_IN;
  //         await manager.save(booking);

  //         if (booking.bookingRooms) {
  //           for (const br of booking.bookingRooms) {
  //             if (br.allocation) {
  //               br.allocation.status = BookingRoomAllocationStatus.CHECKED_IN;
  //               await manager.save(br.allocation);
  //             }
  //           }
  //         }
  //       }
  //       console.log(`[CRON] Auto check-in completed. Processed ${bookingsToCheckIn.length} bookings.`);
  //     });
  //   } catch (error) {
  //     console.error('[CRON] Error during auto check-in job:', error);
  //   }
  // });

  // checkInJob.start();
};
