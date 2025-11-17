
export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  location_type: string;
}

export interface Account {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  industries: string[];
  annual_revenue: string;
  website: string;
  addresses: Address[];
  phone_numbers: string[];
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
}
