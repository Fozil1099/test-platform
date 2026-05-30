export interface User {
  id: string;
  username: string;
  role: "admin" | "teacher" | "student";
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: User["role"];
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  role?: User["role"];
}
