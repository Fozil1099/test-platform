export interface Test {
  id: string;
  title: string;
  answers: number[];
}

export interface CreateTestDto {
  title: string;
  answers: number[];
}

export type UpdateTestDto = CreateTestDto;
