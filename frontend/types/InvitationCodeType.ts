export type InvitationCodeType = {
  id?: string;
  company_id: string;
  invitation_code: string;
  createdAt?: any | null;
  recipient_email?: string | null;
  recipient_name?: string | null;
  status?: string;
  acceptedAt?: any | null;
};
