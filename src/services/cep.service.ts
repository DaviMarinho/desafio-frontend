import axios from 'axios';
import { Endereco, ViaCepError } from '../types/Endereco';
import { removerMascaraCep, validarCep } from '../utils/masks';

const VIACEP_BASE_URL = process.env.REACT_APP_VIACEP_URL;

/**
 * Busca endereço pelo CEP usando ViaCEP API
 * @param cep - CEP para buscar (pode ter máscara)
 * @returns Dados do endereço
 * @throws Error se CEP inválido ou não encontrado
 */
export const buscarCep = async (cep: string): Promise<Endereco> => {
  const cleanCep = removerMascaraCep(cep);

  if (!validarCep(cleanCep)) {
    throw new Error('CEP inválido. Deve conter 8 dígitos.');
  }

  try {
    const response = await axios.get<Endereco | ViaCepError>(
      `${VIACEP_BASE_URL}/${cleanCep}/json/`
    );

    // ViaCEP returns {erro: true} for not found
    if ('erro' in response.data) {
      throw new Error('CEP não encontrado.');
    }

    return response.data as Endereco;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error('CEP não encontrado.');
      }
      throw new Error('Erro ao buscar CEP. Verifique sua conexão.');
    }
    throw error;
  }
};
