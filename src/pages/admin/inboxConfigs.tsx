import type { TriageConfig } from "../../components/admin/TriageManager";
import { updateConsultation, listConsultations, BOOKING_STATUSES, type ConsultationRecord, type BookingStatus } from "../../services/consultations";
import {
  listContactMessages,
  listHiringInquiries,
  MESSAGE_STATUSES,
  INQUIRY_STATUSES,
  updateContactMessage,
  updateHiringInquiry,
  type ContactMessageRecord,
  type HiringInquiryRecord,
  type InquiryStatus,
  type MessageStatus,
} from "../../services/inbox";
import { formatDateTime } from "./cmsConfigs";

function DetailLine({ label, value }: { label: string; value: string | null }) {
  return (
    <p className="admin-detail__line">
      <span className="admin-detail__label">{label}</span>
      <span className="admin-detail__value">{value && value.trim() !== "" ? value : "-"}</span>
    </p>
  );
}

export const messagesConfig: TriageConfig<ContactMessageRecord> = {
  title: "Messages",
  description: "Messages sent through the contact form. Open a message to change its status or add private notes.",
  emptyMessage: "No messages yet.",
  statuses: MESSAGE_STATUSES,
  load: listContactMessages,
  save: (id, values) => updateContactMessage(id, { ...values, status: values.status as MessageStatus }),
  columns: [
    { header: "Subject", render: (row) => row.subject },
    { header: "From", render: (row) => row.name },
    { header: "Received", render: (row) => formatDateTime(row.created_at) },
  ],
  searchText: (row) => `${row.name} ${row.email} ${row.subject} ${row.message}`,
  detail: (row) => (
    <>
      <DetailLine label="From" value={`${row.name} <${row.email}>`} />
      <DetailLine label="Subject" value={row.subject} />
      <DetailLine label="Received" value={formatDateTime(row.created_at)} />
      <p className="admin-detail__message">{row.message}</p>
    </>
  ),
};

export const inquiriesConfig: TriageConfig<HiringInquiryRecord> = {
  title: "Hiring inquiries",
  description: "Opportunities submitted through the hire form.",
  emptyMessage: "No hiring inquiries yet.",
  statuses: INQUIRY_STATUSES,
  load: listHiringInquiries,
  save: (id, values) => updateHiringInquiry(id, { ...values, status: values.status as InquiryStatus }),
  columns: [
    { header: "Name", render: (row) => row.name },
    { header: "Opportunity", render: (row) => row.opportunity_type },
    { header: "Company", render: (row) => row.company ?? "-" },
    { header: "Received", render: (row) => formatDateTime(row.created_at) },
  ],
  searchText: (row) => `${row.name} ${row.email} ${row.company ?? ""} ${row.position_title ?? ""}`,
  detail: (row) => (
    <>
      <DetailLine label="Name" value={row.name} />
      <DetailLine label="Email" value={row.email} />
      <DetailLine label="Phone" value={row.phone} />
      <DetailLine label="Company" value={row.company} />
      <DetailLine label="Opportunity" value={row.opportunity_type} />
      <DetailLine label="Position" value={row.position_title} />
      <DetailLine label="Budget" value={row.budget_range} />
      <DetailLine label="Expected start" value={row.expected_start_date} />
      <DetailLine label="Portfolio" value={row.portfolio_url} />
      <DetailLine label="Description" value={row.project_description} />
      <DetailLine label="Additional info" value={row.additional_info} />
    </>
  ),
};

export const consultationsConfig: TriageConfig<ConsultationRecord> = {
  title: "Consultations",
  description: "Bookings made by visitors. Confirm, complete, or cancel them here.",
  emptyMessage: "No bookings yet.",
  statuses: BOOKING_STATUSES,
  load: listConsultations,
  save: (id, values) => updateConsultation(id, { ...values, status: values.status as BookingStatus }),
  columns: [
    { header: "Client", render: (row) => row.client_name },
    { header: "Type", render: (row) => row.consultation_types?.name ?? "-" },
    { header: "Starts", render: (row) => formatDateTime(row.starts_at) },
  ],
  searchText: (row) => `${row.client_name} ${row.client_email} ${row.consultation_types?.name ?? ""}`,
  detail: (row) => (
    <>
      <DetailLine label="Client" value={`${row.client_name} <${row.client_email}>`} />
      <DetailLine label="Type" value={row.consultation_types?.name ?? null} />
      <DetailLine label="Starts" value={formatDateTime(row.starts_at)} />
      <DetailLine label="Ends" value={formatDateTime(row.ends_at)} />
      <DetailLine label="Client notes" value={row.client_notes} />
    </>
  ),
};
