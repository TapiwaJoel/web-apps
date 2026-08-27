import { DiscSerialDto } from './disc-serial.dto';

export interface ConfirmPrintDto {
  discSerials: DiscSerialDto[]; // may be empty; insurance alone produces no disc
}
