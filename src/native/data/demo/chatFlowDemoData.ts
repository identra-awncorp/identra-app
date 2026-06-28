export const demoBankAccounts = [
  { id: 'tcb', bank: 'Techcombank', number: '1903 1234 5678 9012', owner: 'Nguyá»…n VÄƒn A' },
  { id: 'vcb', bank: 'Vietcombank', number: '0721 9876 5432 1098', owner: 'Nguyá»…n VÄƒn A' },
  { id: 'acb', bank: 'ACB', number: '1234 5678 9012 3456', owner: 'Nguyá»…n VÄƒn A' },
  { id: 'mb', bank: 'MB Bank', number: '5555 6666 7777 8888', owner: 'Nguyá»…n VÄƒn A' },
] as const;

export type DemoBankId = (typeof demoBankAccounts)[number]['id'];
