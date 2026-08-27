import { FulfilmentType, PolicyComponent } from '../../enums';

export interface CreateFulfilmentQuoteDto {
  policyHolderId: string;
  fulfilmentType: FulfilmentType;
  deliveryAddressId?: string; // required for Delivery, absent for Pickup
  components: PolicyComponent[]; // non-empty and unique
}
