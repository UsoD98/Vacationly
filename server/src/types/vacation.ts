export interface VacationInit {
  user_id: number;
  vacation_year: number;
  vacation_available: number;
  created_at: string;
}

export interface VacationSummary {
  vacation_year: number;
  total_vacation: number;
  used_vacation: number;
  remaining_vacation: number;
}
