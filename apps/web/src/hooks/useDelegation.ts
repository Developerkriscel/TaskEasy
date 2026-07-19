import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { delegationApi } from '@/lib/api';
import { getApiError } from '@/lib/axios';

export function useDelegation(params?: Record<string, any>, enabled = true) {
  return useQuery({
    queryKey: ['delegation', params],
    queryFn: () => delegationApi.findAll(params),
    enabled,
  });
}

export function useMyPendingDelegation() {
  return useQuery({
    queryKey: ['delegation', 'my-pending'],
    queryFn: delegationApi.myPending,
  });
}

export function useCreateDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: delegationApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delegation'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Tasks assigned!');
    },
    onError: (err) => toast.error(getApiError(err)),
  });
}

export function useCreateDelegationBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: delegationApi.bulkCreate,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['delegation'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`${data.length} tasks assigned!`);
    },
    onError: (err) => toast.error(getApiError(err)),
  });
}

export function useSubmitDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; doerRemarks: string; attachmentIds?: string[] }) =>
      delegationApi.submit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delegation'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Sent for approval!');
    },
    onError: (err) => toast.error(getApiError(err)),
  });
}

export function useApproveDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; remarks?: string; rating?: number }) =>
      delegationApi.approve(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delegation'] });
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Approved!');
    },
    onError: (err) => toast.error(getApiError(err)),
  });
}

export function useReworkDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reworkRemark }: { id: string; reworkRemark: string }) =>
      delegationApi.rework(id, { reworkRemark }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delegation'] });
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Sent back for rework');
    },
    onError: (err) => toast.error(getApiError(err)),
  });
}

export function useBulkDeleteDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => delegationApi.bulkDelete(ids),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['delegation'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('All cleared!');
    },
    onError: (err) => toast.error(getApiError(err)),
  });
}
