export interface Contact {
  id: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  emails: string[];
  phone_numbers: string[];
  deal_ids: string[];
  account_ids: string[];
  created_at: string | null;  // ISO Date string or null
  updated_at: string | null;  // ISO Date string or null
}
