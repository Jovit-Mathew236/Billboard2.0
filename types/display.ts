export interface DisplaySettings {
  headerText: string;
  title: string;
  logoText: string;
  backgroundImageUrl: string;
  backgroundS3Key: string;
  backgroundColor?: string;
  batchYear?: string;
  studentCount?: string;
  placements?: string;
  higherStudy?: string;
}

export interface StaffPosition {
  id: string;
  position: string;
  count: string;
  order?: number;
}

export interface FacultyMember {
  id: string;
  name: string;
  specializedIn: string;
  order?: number;
}

export interface CarouselImage {
  id: string;
  imageUrl: string;
  s3Key?: string;
  addedBy?: string;
  addedByUid?: string;
  uploadedAt?: string;
  order?: number;
}

export interface Lab {
  id: string;
  name: string;
  code: string;
  subject: string;
  thumbnailUrl?: string;
  thumbnailS3Key?: string;
  order?: number;
}

export type UserRole = "admin" | "superadmin" | "faculty";

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  imageUrl?: string;
  addedBy?: string;
}

export interface BatchInput {
  batchYear: string;
  studentCount: string;
  placements: string;
  higherStudy: string;
}
