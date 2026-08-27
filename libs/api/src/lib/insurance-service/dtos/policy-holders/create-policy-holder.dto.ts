export interface CreatePolicyHolderDto {
  systemUserId: string;
  nationalId?: string; // Zimbabwe format, e.g. 63-1234567A42
  driversLicence?: string; // document id in content-management-service
  proofOfAddress?: string; // document id in content-management-service
}
