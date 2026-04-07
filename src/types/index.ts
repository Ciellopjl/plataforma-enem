import { Prisma } from "@prisma/client";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "STUDENT" | "ADMIN";
  isBlocked: boolean;
  needsPassword?: boolean;
};

export type ProgressWithDetails = Prisma.ProgressGetPayload<{
  include: {
    content: true;
    lesson: true;
  };
}>;

export type UserWithProgress = Prisma.UserGetPayload<{
  include: {
    progress: {
      include: {
        content: true;
        lesson: true;
      };
    };
  };
}>;

export type SubjectWithRelations = Prisma.SubjectGetPayload<{
  include: {
    contents: true;
    lessons: {
      include: {
        progress: true;
      };
    };
    quizzes: {
      include: {
        questions: true;
        attempts: true;
      };
    };
  };
}>;
