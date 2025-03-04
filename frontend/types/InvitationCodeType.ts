export type InvitationCodeType = {
  id?: string;
  company_id: string;
  invitation_code: string;
  createdAt?: string | null;
  recipient_email?: string | null;
  recipient_name?: string | null;
  status?: string;
};
