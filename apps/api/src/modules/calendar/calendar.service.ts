import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HierarchyService } from '../hierarchy/hierarchy.service';

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    private hierarchy: HierarchyService,
  ) {}

  private recurringDateForYear(source: Date | null | undefined, year: number): Date | null {
    if (!source) return null;
    const month = source.getUTCMonth();
    const day = source.getUTCDate();
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(day, lastDayOfMonth), 12, 0, 0));
  }

  async getEvents(
    tenantId: string,
    userId: string,
    role: string,
    from: Date,
    to: Date,
  ) {
    // null => SAAS_OWNER (sees everyone). Otherwise scope to the
    // caller's hierarchy team (Admin/Manager) or themselves (Employee) —
    // previously any Admin/Manager saw every event in the whole tenant
    // regardless of which team they actually manage.
    const visibleIds = await this.hierarchy.getVisibleUserIds(userId, role, tenantId);

    const [delegation, workRequests, checklist, fmsTasks, holidays, celebrationUsers] = await Promise.all([
      this.prisma.delegationTask.findMany({
        where: {
          tenantId,
          ...(visibleIds ? { delegatedToId: { in: visibleIds } } : {}),
          targetDate: { gte: from, lte: to },
        },
        select: {
          id: true, title: true, targetDate: true, status: true, priority: true,
          delegatedToId: true,
        },
      }),
      this.prisma.workRequest.findMany({
        where: {
          tenantId,
          ...(visibleIds ? { requestedForId: { in: visibleIds } } : {}),
          deadlineDate: { gte: from, lte: to },
        },
        select: {
          id: true, requestId: true, description: true, deadlineDate: true, status: true,
          requestedForId: true,
        },
      }),
      this.prisma.checklistTask.findMany({
        where: {
          tenantId,
          ...(visibleIds ? { assignedToId: { in: visibleIds } } : {}),
          plannedDate: { gte: from, lte: to },
        },
        select: {
          id: true, title: true, plannedDate: true, status: true, frequency: true,
          assignedToId: true,
        },
      }),
      this.prisma.fmsTask.findMany({
        where: {
          tenantId,
          ...(visibleIds ? { personId: { in: visibleIds } } : {}),
          plannedDate: { gte: from, lte: to },
        },
        select: {
          id: true, stepName: true, plannedDate: true, status: true,
          personId: true, fmsName: true,
        },
      }),
      this.prisma.holidayCalendar.findMany({
        where: {
          tenantId,
          date: { gte: from, lte: to },
        },
        select: { id: true, name: true, date: true },
      }),
      this.prisma.user.findMany({
        where: {
          tenantId,
          status: 'ACTIVE',
          ...(visibleIds ? { id: { in: visibleIds } } : {}),
          OR: [
            { dateOfBirth: { not: null } },
            { anniversaryDate: { not: null } },
            { joiningDate: { not: null } },
          ],
        },
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          anniversaryDate: true,
          joiningDate: true,
        },
      }),
    ]);

    const celebrationEvents = celebrationUsers.flatMap((user) => {
      const events: Array<{
        id: string;
        title: string;
        date: Date;
        status: string;
        type: 'BIRTHDAY' | 'ANNIVERSARY';
      }> = [];
      const fromTime = from.getTime();
      const toTime = to.getTime();

      const birthdayDate = this.recurringDateForYear(user.dateOfBirth, from.getUTCFullYear());
      if (birthdayDate && birthdayDate.getTime() >= fromTime && birthdayDate.getTime() <= toTime) {
        events.push({
          id: `birthday-${user.id}-${from.getUTCFullYear()}`,
          title: `${user.name}'s Birthday`,
          date: birthdayDate,
          status: 'CELEBRATION',
          type: 'BIRTHDAY',
        });
      }

      const anniversarySource = user.anniversaryDate ?? user.joiningDate;
      const anniversaryDate = this.recurringDateForYear(anniversarySource, from.getUTCFullYear());
      if (anniversaryDate && anniversaryDate.getTime() >= fromTime && anniversaryDate.getTime() <= toTime) {
        events.push({
          id: `anniversary-${user.id}-${from.getUTCFullYear()}`,
          title: `${user.name}'s Work Anniversary`,
          date: anniversaryDate,
          status: 'CELEBRATION',
          type: 'ANNIVERSARY',
        });
      }

      return events;
    });

    return {
      delegation: delegation.map((t) => ({ ...t, type: 'DELEGATION', date: t.targetDate })),
      workRequests: workRequests.map((t) => ({
        ...t,
        title: t.requestId,
        type: 'WORK_REQUEST',
        date: t.deadlineDate,
      })),
      checklist: checklist.map((t) => ({ ...t, type: 'CHECKLIST', date: t.plannedDate })),
      fms: fmsTasks.map((t) => ({
        ...t,
        title: t.stepName,
        type: 'FMS',
        date: t.plannedDate,
      })),
      holidays: holidays.map((h) => ({
        id: h.id,
        title: h.name,
        date: h.date,
        type: 'HOLIDAY' as const,
      })),
      celebrations: celebrationEvents,
    };
  }
}
