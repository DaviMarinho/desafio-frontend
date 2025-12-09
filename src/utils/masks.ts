/**
 * Formats a CEP string to 00000-000 format
 * @param cep - Raw CEP string (can be with or without mask)
 * @returns Formatted CEP string
 */
export const formatarCep = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
};

/**
 * Removes mask from CEP string
 * @param cep - Masked CEP string
 * @returns Clean CEP string with only numbers
 */
export const removerMascaraCep = (cep: string): string => {
  return cep.replace(/\D/g, '');
};

/**
 * Validates if CEP has correct length
 * @param cep - CEP string to validate
 * @returns true if valid (8 digits)
 */
export const validarCep = (cep: string): boolean => {
  const cleaned = removerMascaraCep(cep);
  return cleaned.length === 8;
};
