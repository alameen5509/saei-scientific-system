// أنواع نظام التحكيم المعمى

export type ReviewStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "DECLINED";

export type ReviewDecision =
  | "ACCEPT"
  | "MINOR_REVISION"
  | "MAJOR_REVISION"
  | "REJECT";

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  ASSIGNED: "بانتظار البدء",
  IN_PROGRESS: "قيد التحكيم",
  SUBMITTED: "تمّ الإرسال",
  DECLINED: "اعتذر المحكم",
};

export const REVIEW_DECISION_LABEL: Record<ReviewDecision, string> = {
  ACCEPT: "قبول",
  MINOR_REVISION: "تعديلات يسيرة",
  MAJOR_REVISION: "تعديلات جوهرية",
  REJECT: "رفض",
};

export type BadgeTone =
  | "purple"
  | "gold"
  | "teal"
  | "green"
  | "red"
  | "amber"
  | "gray";

export function reviewStatusTone(s: ReviewStatus): BadgeTone {
  switch (s) {
    case "ASSIGNED":
      return "purple";
    case "IN_PROGRESS":
      return "amber";
    case "SUBMITTED":
      return "green";
    case "DECLINED":
      return "gray";
  }
}

export function reviewDecisionTone(d: ReviewDecision): BadgeTone {
  switch (d) {
    case "ACCEPT":
      return "green";
    case "MINOR_REVISION":
      return "teal";
    case "MAJOR_REVISION":
      return "amber";
    case "REJECT":
      return "red";
  }
}

// ————————————————————————————————
// DTOs
// ————————————————————————————————

/** بيانات المحكم — تظهر للمنسق فقط */
export interface ReviewerDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  expertise: string | null;
  specialties: string[];
  active: boolean;
  totalAssigned: number;
  totalCompleted: number;
  /** نسبة الإكمال — مشتقّة */
  responseRate: number;
  createdAt: string;
}

/** بيانات العمل المعمَّاة — تظهر للمحكم بدون كشف الباحث */
export interface BlindWorkDto {
  id: string;
  title: string;
  specialty: string;
  track: string;
  notes: string | null;
}

/** عرض المراجعة من جهة المحكم — معمَّى */
export interface ReviewerReviewDto {
  id: string;
  status: ReviewStatus;
  decision: ReviewDecision | null;
  scientificScore: number | null;
  linguisticScore: number | null;
  methodologyScore: number | null;
  recommendations: string | null;
  notesToEditor: string | null;
  assignedAt: string;
  dueDate: string | null;
  submittedAt: string | null;
  work: BlindWorkDto;
}

/** عرض المراجعة من جهة المنسق — كامل (مع الباحث) */
export interface CoordinatorReviewDto extends ReviewerReviewDto {
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
  workCode: string;
  researcher: string;
  lastRemindedAt: string | null;
}

// ————————————————————————————————
// نموذج الإرسال
// ————————————————————————————————

export interface ReviewSubmitInput {
  scientificScore: number;
  linguisticScore: number;
  methodologyScore: number;
  decision: ReviewDecision;
  recommendations: string;
  notesToEditor?: string;
}
