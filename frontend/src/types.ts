export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  status: string;
  created_at: string;
}

export interface Applicant {
  id: number;
  job_id: number;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status: string;
  applied_at: string;
}

export interface ApplicantWithJob extends Applicant {
  job_title?: string;
}

export interface DeleteResponse {
  success: boolean;
}