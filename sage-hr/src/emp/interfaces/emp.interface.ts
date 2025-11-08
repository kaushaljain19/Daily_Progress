export interface Employees {
  Id: string;
  First_name: string;
  Last_name: string;
  Full_name: string;
  Display_name: string;
  Avatar_url: string | null;
  Date_of_birth: string | null;
  Upcoming_birthday_date: string | null;
  Email: string;
  Phone_number: string | null;
  Hire_date: string | null;
  Start_date: string | null;
  Termination_date: string | null;
  Tenure: string;
  Job: {
    Title: string | null;
    Description: string | null;
    Id: string | null;
  };
  Employments: {
    Effective_date: string | null;
    Salary: string | null;
    Employment_type: string | null;
  };
}
