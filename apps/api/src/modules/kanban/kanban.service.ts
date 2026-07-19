import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { HierarchyService } from '../hierarchy/hierarchy.service';
import { isApproverRole } from '../../common/utils/role.utils';
import { CachePatterns } from '../../common/utils/cache-keys.utils';

const KANBAN_COLUMNS = ['PENDING', 'IN_PROGRESS', 'SEND_FOR_APPROVAL', 'REWORK', 'COMPLETED'] as const;

const ALLOWED_MOVES: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'SEND_FOR_APPROVAL', 'COMPLETED'],
  IN_PROGRESS: ['PENDING', 'SEND_FOR_APPROVAL', 'COMPLETED'],
  SEND_FOR_APPROVAL: ['PENDING', 'IN_PROGRESS', 'REWORK', 'COMPLETED'],
  REWORK: ['PENDING', 'IN_PROGRESS', 'SEND_FOR_APPROVAL', 'COMPLETED'],
  COMPLETED: ['PENDING', 'IN_PROGRESS'],
};

@Injectable()
export class KanbanService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private hierarchy: HierarchyService,
  ) {}

  async getBoard(tenantId: string, userId: string, role: string, projectId?: string) {
    const visibleIds = await this.hierarchy.getVisibleUserIds(userId, role, tenantId);

    const where: any = { tenantId };
    // null => SAAS_OWNER, sees everyone in the tenant.
    // Otherwise scope to the caller's hierarchy team (Admin/Manager) or
    // just themselves (Employee) — matches every other module's visibility
    // rule. Previously any Admin/Manager saw the WHOLE tenant's board,
    // including tasks outside their assigned team.
    if (visibleIds) where.delegatedToId = { in: visibleIds };
    if (projectId) where.projectId = projectId;

    const tasks = await this.prisma.delegationTask.findMany({
      where,
      include: {
        delegatedTo: { select: { id: true, name: true } },
        delegatedBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: [{ priority: 'desc' }, { targetDate: 'asc' }],
    });

    // Group by status column
    const board = Object.fromEntries(
      KANBAN_COLUMNS.map((col) => [col, tasks.filter((t) => t.status === col)]),
    );

    return { board, columns: KANBAN_COLUMNS };
  }

  async moveCard(
    taskId: string,
    toStatus: string,
    tenantId: string,
    userId: string,
    role: string,
    remarks?: string,
  ) {
    const task = await this.prisma.delegationTask.findFirst({ where: { id: taskId, tenantId } });
    if (!task) throw new NotFoundException('Task not found');

    const isAdmin = isApproverRole(role);
    if (!isAdmin && task.delegatedToId !== userId) {
      throw new ForbiddenException('You can only move your own tasks');
    }

    const allowedTargets = ALLOWED_MOVES[task.status] ?? [];
    if (!allowedTargets.includes(toStatus)) {
      throw new BadRequestException(
        `Can't move from ${task.status} to ${toStatus}`,
      );
    }

    const data: any = { status: toStatus };
    if (remarks) data.doerRemarks = remarks;

    const updated = await this.prisma.delegationTask.update({
      where: { id: taskId },
      data,
    });

    // BE-04 fix: dashboard counts key off task status; invalidate after moves.
    await this.redis.delByPattern(CachePatterns.dashboard(tenantId));
    await this.redis.delByPattern(CachePatterns.mis(tenantId));

    return updated;
  }
}
