import { AccountRecoveryType } from '../../enums';

export interface AccountRecoveryDto {
  identifier: string; // email OR phone (+263...)
  recoveryType: AccountRecoveryType;
}
