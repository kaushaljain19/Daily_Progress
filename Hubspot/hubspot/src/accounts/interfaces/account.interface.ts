export interface Account {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  industries: string[];
  annual_revenue: string;
  website: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    location_type: string;
  }[];
  phone_numbers: string[];
  created_at: string;
  updated_at: string;
}
