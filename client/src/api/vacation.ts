import apiClient from '@/api/apiClient.ts';
import type { ApiResponse } from '@/types';

export interface VacationRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  used_days: number;
  reason: string;
  created_at: string;
}

export interface VacationRequestInput {
  start_date: string;
  end_date: string;
  used_days: number;
  reason: string;
}

export interface VacationSummary {
  vacation_year: number;
  total_vacation: number;
  used_vacation: number;
  remaining_vacation: number;
}

export interface VacationInitInput {
  vacation_available: number;
}

export const vacationApi = {
  // 휴가 신청
  requestVacation: async (data: VacationRequestInput): Promise<ApiResponse<{ id: number }>> => {
    const { data: response } = await apiClient.post('/api/vacation/request', data);
    return response;
  },

  // 사용자의 휴가 신청 내역 조회
  getUserRequests: async (): Promise<ApiResponse<VacationRequest[]>> => {
    const { data: response } = await apiClient.get('/api/vacation/requests');
    return response;
  },

  // 휴가 신청 취소
  deleteRequest: async (requestId: number): Promise<ApiResponse<void>> => {
    const { data: response } = await apiClient.delete(`/api/vacation/requests/${requestId}`);
    return response;
  },

  // 남은 연차 조회
  getRemainingVacation: async (): Promise<ApiResponse<{ remaining: number }>> => {
    const { data: response } = await apiClient.get('/api/vacation/remaining');
    return response;
  },

  // 연차 총합/사용/잔여 조회
  getVacationSummary: async (): Promise<ApiResponse<VacationSummary>> => {
    const { data: response } = await apiClient.get('/api/vacation/summary');
    return response;
  },

  // 기본 연차 저장/수정
  saveInitialVacation: async (data: VacationInitInput): Promise<ApiResponse<VacationSummary>> => {
    const { data: response } = await apiClient.post('/api/vacation/init', data);
    return response;
  },
};
