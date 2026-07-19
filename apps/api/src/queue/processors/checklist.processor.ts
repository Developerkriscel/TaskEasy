import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../../modules/automation/automation.service';
import { generateChecklistTaskId, atomicNextChecklistTaskId } from '../../common/utils/id-generator.utils';
import { parseFrontendDateTime, skipToNextWorkingDay } from '../../common/utils/date.utils';
import { QUEUES } from '../queue.constants';

export interface GenerateChecklistTasksJob {
  masterId: string;
  tenantId: string;
}

const DAY_NAME_TO_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

@Processor(QUEUES.CHECKLIST)
export class ChecklistProcessor {
  private readonly logger = new Logger(ChecklistProcessor.name);

  constructor(
    private prisma: PrismaService,
    private automation: AutomationService,
    @InjectQueue(QUEUES.NOTIFICATION) private notificationQueue: Queue,
  ) {}

  /**
   * Generates planned checklist task instances from a master.
   * For DAILY frequency, only generates today's task — a daily cron creates subsequent ones.
   * For other frequencies, generates all occurrences up front.
   */
  @Process('generate-tasks')
  async handleGenerateTasks(job: Job<GenerateChecklistTasksJob>) {
    const { masterId, tenantId } = job.data;

    const master = await this.prisma.checklistMaster.findUnique({
      where: { id: masterId },
    });
    if (!master || !master.isActive) return;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { timezone: true, workingDays: true },
    });
    const timezone = tenant?.timezone ?? 'UTC';
    const workingDays = tenant?.workingDays?.length ? tenant.workingDays : [1, 2, 3, 4, 5, 6];
    const startTime = master.startTime || '09:00';

    const rawDates = this.generateOccurrenceDates(
      master.startDate,
      master.frequency as any,
      master.endDate,
      master.days,
      master.extraDates,
    );

    const rangeEnd = master.endDate
      ?? new Date(master.startDate.getFullYear() + 1, master.startDate.getMonth(), master.startDate.getDate());
    const holidays = await this.prisma.holidayCalendar.findMany({
      where: { tenantId, date: { gte: master.startDate, lte: rangeEnd } },
      select: { date: true },
    });
    const holidayDates = holidays.map((h) => h.date);

    const dates = rawDates.map((d) => skipToNextWorkingDay(d, workingDays, holidayDates, timezone));

    const tasks = await Promise.all(
      dates.map(async (date) => {
        const seq = await atomicNextChecklistTaskId(this.prisma, tenantId);
        return {
          tenantId,
          masterId,
          taskId: generateChecklistTaskId(seq),
          assignedToId: master.assignedToId,
          projectId: master.projectId,
          title: master.title,
          description: master.description,
          frequency: master.frequency,
          plannedDate: parseFrontendDateTime(this.toDateString(date), startTime, timezone),
          plannedTime: master.startTime,
          attachmentRequired: master.attachmentRequired,
        };
      }),
    );

    if (tasks.length > 0) {
      await this.prisma.checklistTask.createMany({ data: tasks });
      this.logger.log(`Generated ${tasks.length} checklist tasks for master: ${masterId}`);

      const firstTask = await this.prisma.checklistTask.findFirst({
        where: { tenantId, masterId },
        orderBy: { createdAt: 'asc' },
        select: { id: true, taskId: true },
      });

      if (firstTask) {
        await this.notificationQueue.add('create-notification', {
          tenantId,
          userId: master.assignedToId,
          type: 'CHECKLIST_ASSIGNED',
          title: '📝 Checklist Assigned',
          body: `Checklist "${master.title}" has been assigned to you.${master.frequency === 'DAILY' ? ' Tasks will be created daily.' : ` ${tasks.length} planned task(s) have been scheduled.`}`,
          refType: 'CHECKLIST',
          refId: firstTask.id,
        });
      }
    }
  }

  /**
   * Daily cron job: generates today's checklist task for all active DAILY masters.
   */
  @Process('generate-daily')
  async handleGenerateDaily(job: Job) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const masters = await this.prisma.checklistMaster.findMany({
      where: {
        frequency: 'DAILY',
        isActive: true,
        startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } },
        ],
      },
      include: {
        tenant: { select: { timezone: true, workingDays: true } },
      },
    });

    let created = 0;

    for (const master of masters) {
      const timezone = master.tenant?.timezone ?? 'UTC';
      const workingDays = master.tenant?.workingDays?.length ? master.tenant.workingDays : [1, 2, 3, 4, 5, 6];
      const startTime = master.startTime || '09:00';

      const holidays = await this.prisma.holidayCalendar.findMany({
        where: {
          tenantId: master.tenantId,
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
          },
        },
        select: { date: true },
      });
      const holidayDates = holidays.map((h) => h.date);

      const adjustedDate = skipToNextWorkingDay(today, workingDays, holidayDates, timezone);
      const adjustedDateStr = this.toDateString(adjustedDate);
      const todayStr = this.toDateString(today);

      // Only create if the adjusted date is today (skip non-working days)
      if (adjustedDateStr !== todayStr) continue;

      const plannedDate = parseFrontendDateTime(todayStr, startTime, timezone);

      // Check if task already exists for this master+date
      const existing = await this.prisma.checklistTask.findFirst({
        where: { masterId: master.id, plannedDate },
      });
      if (existing) continue;

      const seq = await atomicNextChecklistTaskId(this.prisma, master.tenantId);
      await this.prisma.checklistTask.create({
        data: {
          tenantId: master.tenantId,
          masterId: master.id,
          taskId: generateChecklistTaskId(seq),
          assignedToId: master.assignedToId,
          projectId: master.projectId,
          title: master.title,
          description: master.description,
          frequency: master.frequency,
          plannedDate,
          plannedTime: master.startTime,
          attachmentRequired: master.attachmentRequired,
        },
      });
      created++;
    }

    if (created > 0) {
      this.logger.log(`Daily cron: created ${created} checklist tasks for DAILY masters`);
    }
  }

  /**
   * Hourly job: check for missed checklist tasks.
   * Marks overdue tasks as LATE.
   */
  @Process('check-missed')
  async handleCheckMissed(job: Job<{ tenantId?: string }>) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const where: any = {
      status: 'PENDING',
      plannedDate: { lt: yesterday },
      ...(job.data.tenantId ? { tenantId: job.data.tenantId } : {}),
    };

    const missed = await this.prisma.checklistTask.findMany({
      where,
      select: { id: true, tenantId: true, title: true, assignedToId: true },
    });

    if (missed.length === 0) return;

    await Promise.all(
      missed.map(async (task) => {
        await this.prisma.checklistTask.update({
          where: { id: task.id },
          data: { status: 'LATE' },
        });
        await this.automation.triggerEvent(task.tenantId, 'CHECKLIST_MISSED', {
          taskId: task.id,
          taskTitle: task.title,
          refType: 'CHECKLIST',
          assigneeId: task.assignedToId,
        });
      }),
    );

    this.logger.log(`Marked ${missed.length} checklist tasks as LATE`);
  }

  private toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Generates occurrence dates based on frequency.
   *
   * - DAILY: only today's date (subsequent days created by the daily cron)
   * - WEEKLY: uses selected days of the week from `days` array
   * - FORTNIGHTLY: uses the 3 specific dates from `extraDates`, recurring every fortnight
   * - MONTHLY/QUARTERLY: uses specific date from `extraDates[0]` if provided
   * - HALF_YEARLY: uses 2 dates from `extraDates`
   * - YEARLY: uses specific date from `extraDates[0]` if provided
   * - ONE_TIME: just the start date
   */
  private generateOccurrenceDates(
    startDate: Date,
    frequency: string,
    endDate?: Date | null,
    days?: string[],
    extraDates?: string[],
    maxOccurrences = 365,
  ): Date[] {
    const limit = endDate || new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());

    // DAILY: only generate today's task — daily cron handles the rest
    if (frequency === 'DAILY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      // If start date is in the future, use start date; otherwise use today
      const taskDate = start > today ? start : today;
      if (taskDate > limit) return [];
      return [taskDate];
    }

    // ONE_TIME: just the start date
    if (frequency === 'ONE_TIME') {
      return [new Date(startDate)];
    }

    // WEEKLY with specific days selected
    if (frequency === 'WEEKLY' && days && days.length > 0) {
      return this.generateWeeklyByDays(startDate, limit, days, maxOccurrences);
    }

    // FORTNIGHTLY with extraDates — use the specific dates as anchors
    if (frequency === 'FORTNIGHTLY' && extraDates && extraDates.length > 0) {
      return this.generateFromExtraDates(extraDates, limit, 14, maxOccurrences);
    }

    // HALF_YEARLY with extraDates — use the 2 specific dates as anchors
    if (frequency === 'HALF_YEARLY' && extraDates && extraDates.length > 0) {
      return this.generateFromExtraDates(extraDates, limit, null, maxOccurrences, 6);
    }

    // MONTHLY/QUARTERLY/YEARLY with extraDates — use extraDates[0] as the anchor date
    if ((frequency === 'MONTHLY' || frequency === 'QUARTERLY' || frequency === 'YEARLY') && extraDates && extraDates.length > 0 && extraDates[0]) {
      const monthStep = frequency === 'MONTHLY' ? 1 : frequency === 'QUARTERLY' ? 3 : 12;
      return this.generateFromExtraDates([extraDates[0]], limit, null, maxOccurrences, monthStep);
    }

    // Fallback: simple interval stepping from startDate
    return this.generateByInterval(startDate, frequency, limit, maxOccurrences);
  }

  /**
   * WEEKLY: generates dates for specific days of the week.
   */
  private generateWeeklyByDays(startDate: Date, limit: Date, days: string[], maxOccurrences: number): Date[] {
    const dayIndices = days.map((d) => DAY_NAME_TO_INDEX[d]).filter((d) => d !== undefined);
    if (dayIndices.length === 0) return this.generateByInterval(startDate, 'WEEKLY', limit, maxOccurrences);

    const dates: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= limit && dates.length < maxOccurrences) {
      if (dayIndices.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Generates recurring dates from specific anchor dates, stepping by days or months.
   */
  private generateFromExtraDates(
    extraDates: string[],
    limit: Date,
    dayStep: number | null,
    maxOccurrences: number,
    monthStep?: number,
  ): Date[] {
    const dates: Date[] = [];

    for (const dateStr of extraDates) {
      if (!dateStr) continue;
      const anchor = new Date(dateStr);
      anchor.setHours(0, 0, 0, 0);
      const current = new Date(anchor);

      while (current <= limit && dates.length < maxOccurrences) {
        dates.push(new Date(current));
        if (dayStep) {
          current.setDate(current.getDate() + dayStep);
        } else if (monthStep) {
          current.setMonth(current.getMonth() + monthStep);
        } else {
          break;
        }
      }
    }

    dates.sort((a, b) => a.getTime() - b.getTime());
    return dates;
  }

  /**
   * Fallback: simple interval stepping (used when no days/extraDates provided).
   */
  private generateByInterval(startDate: Date, frequency: string, limit: Date, maxOccurrences: number): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= limit && dates.length < maxOccurrences) {
      dates.push(new Date(current));

      switch (frequency) {
        case 'WEEKLY':       current.setDate(current.getDate() + 7); break;
        case 'FORTNIGHTLY':  current.setDate(current.getDate() + 14); break;
        case 'MONTHLY':      current.setMonth(current.getMonth() + 1); break;
        case 'QUARTERLY':    current.setMonth(current.getMonth() + 3); break;
        case 'HALF_YEARLY':  current.setMonth(current.getMonth() + 6); break;
        case 'YEARLY':       current.setFullYear(current.getFullYear() + 1); break;
        default:             return dates;
      }
    }

    return dates;
  }
}
