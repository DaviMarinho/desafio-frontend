import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BuscaCep from './index';
import * as cepService from '../../services/cep.service';

// Mock do serviço de CEP
jest.mock('../../services/cep.service');

const mockBuscarCep = cepService.buscarCep as jest.MockedFunction<typeof cepService.buscarCep>;

describe('Feature: Busca de CEP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scenario: Renderização inicial da página', () => {
    it('Given que eu acesso a página de busca de CEP, Then os elementos principais devem estar visíveis', () => {
      // Given & When
      render(<BuscaCep />);

      // Then
      expect(screen.getByText('Busca de CEP')).toBeInTheDocument();
      expect(screen.getByLabelText('CEP')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    });

    it('Given que eu acesso a página, Then o botão Buscar deve estar desabilitado inicialmente', () => {
      // Given & When
      render(<BuscaCep />);

      // Then
      const buscarButton = screen.getByRole('button', { name: /buscar/i });
      expect(buscarButton).toBeDisabled();
    });
  });

  describe('Scenario: Buscar CEP válido com sucesso', () => {
    const mockEndereco = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107',
    };

    it('Given que eu estou na página de busca, When eu digito um CEP válido e clico em Buscar, Then o endereço deve ser exibido', async () => {
      // Given
      mockBuscarCep.mockResolvedValueOnce(mockEndereco);
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      await userEvent.type(input, '01310100');
      fireEvent.click(buscarButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText('Endereço Encontrado')).toBeInTheDocument();
      });

      expect(screen.getByText('Avenida Paulista')).toBeInTheDocument();
      expect(screen.getByText('Bela Vista')).toBeInTheDocument();
      expect(screen.getByText('São Paulo')).toBeInTheDocument();
      expect(screen.getByText('SP')).toBeInTheDocument();
    });

    it('Given que eu digito um CEP, When eu digito, Then a máscara deve ser aplicada automaticamente', async () => {
      // Given
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP') as HTMLInputElement;
      await userEvent.type(input, '01310100');

      // Then
      expect(input.value).toBe('01310-100');
    });

    it('Given que estou buscando um CEP, When a requisição está em andamento, Then deve exibir estado de loading', async () => {
      // Given
      mockBuscarCep.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockEndereco), 100))
      );
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      await userEvent.type(input, '01310100');
      fireEvent.click(buscarButton);

      // Then
      expect(screen.getByRole('button', { name: /buscando/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /buscando/i })).toBeDisabled();

      // Aguarda finalizar
      await waitFor(() => {
        expect(screen.getByText('Endereço Encontrado')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: Buscar CEP inválido', () => {
    it('Given que eu digito um CEP inválido, When eu clico em Buscar, Then deve exibir mensagem de erro', async () => {
      // Given
      mockBuscarCep.mockRejectedValueOnce(new Error('CEP inválido. Deve conter 8 dígitos.'));
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      await userEvent.type(input, '12345678');
      fireEvent.click(buscarButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText('CEP inválido. Deve conter 8 dígitos.')).toBeInTheDocument();
      });

      // Não deve exibir resultado
      expect(screen.queryByText('Endereço Encontrado')).not.toBeInTheDocument();
    });
  });

  describe('Scenario: Buscar CEP não encontrado', () => {
    it('Given que eu digito um CEP válido mas inexistente, When eu clico em Buscar, Then deve exibir mensagem de CEP não encontrado', async () => {
      // Given
      mockBuscarCep.mockRejectedValueOnce(new Error('CEP não encontrado.'));
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      await userEvent.type(input, '99999999');
      fireEvent.click(buscarButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText('CEP não encontrado.')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: Erro de rede ao buscar CEP', () => {
    it('Given que há um erro de conexão, When eu tento buscar um CEP, Then deve exibir mensagem de erro de rede', async () => {
      // Given
      mockBuscarCep.mockRejectedValueOnce(
        new Error('Erro ao buscar CEP. Verifique sua conexão.')
      );
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      await userEvent.type(input, '01310100');
      fireEvent.click(buscarButton);

      // Then
      await waitFor(() => {
        expect(
          screen.getByText('Erro ao buscar CEP. Verifique sua conexão.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: Limpar formulário', () => {
    it('Given que eu tenho dados preenchidos, When eu clico em Limpar, Then todos os campos devem ser resetados', async () => {
      // Given
      const mockEndereco = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      };
      mockBuscarCep.mockResolvedValueOnce(mockEndereco);
      render(<BuscaCep />);

      const input = screen.getByLabelText('CEP') as HTMLInputElement;
      const buscarButton = screen.getByRole('button', { name: /buscar/i });
      const limparButton = screen.getByRole('button', { name: /limpar/i });

      await userEvent.type(input, '01310100');
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('Endereço Encontrado')).toBeInTheDocument();
      });

      // When
      fireEvent.click(limparButton);

      // Then
      expect(input.value).toBe('');
      expect(screen.queryByText('Endereço Encontrado')).not.toBeInTheDocument();
    });
  });

  describe('Scenario: Validação do formulário', () => {
    it('Given que o CEP tem menos de 9 caracteres, Then o botão Buscar deve estar desabilitado', async () => {
      // Given
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      await userEvent.type(input, '01310');

      // Then
      const buscarButton = screen.getByRole('button', { name: /buscar/i });
      expect(buscarButton).toBeDisabled();
    });

    it('Given que o CEP está completo (9 caracteres com máscara), Then o botão Buscar deve estar habilitado', async () => {
      // Given
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      await userEvent.type(input, '01310100');

      // Then
      const buscarButton = screen.getByRole('button', { name: /buscar/i });
      expect(buscarButton).not.toBeDisabled();
    });
  });

  describe('Scenario: Comportamento durante loading', () => {
    it('Given que uma busca está em andamento, Then os campos devem estar desabilitados', async () => {
      // Given
      mockBuscarCep.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  cep: '01310-100',
                  logradouro: 'Avenida Paulista',
                  complemento: '',
                  bairro: 'Bela Vista',
                  localidade: 'São Paulo',
                  uf: 'SP',
                  ibge: '3550308',
                  gia: '1004',
                  ddd: '11',
                  siafi: '7107',
                }),
              100
            )
          )
      );
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP') as HTMLInputElement;
      const buscarButton = screen.getByRole('button', { name: /buscar/i });
      const limparButton = screen.getByRole('button', { name: /limpar/i });

      await userEvent.type(input, '01310100');
      fireEvent.click(buscarButton);

      // Then
      expect(input).toBeDisabled();
      expect(limparButton).toBeDisabled();

      // Aguarda finalizar
      await waitFor(() => {
        expect(screen.getByText('Endereço Encontrado')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: Exibição de campos vazios', () => {
    it('Given que o endereço não possui alguns campos, When o resultado é exibido, Then deve mostrar "-" para campos vazios', async () => {
      // Given
      const mockEnderecoIncompleto = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: '',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      };
      mockBuscarCep.mockResolvedValueOnce(mockEnderecoIncompleto);
      render(<BuscaCep />);

      // When
      const input = screen.getByLabelText('CEP');
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      await userEvent.type(input, '01310100');
      fireEvent.click(buscarButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText('Endereço Encontrado')).toBeInTheDocument();
      });

      const resultItems = screen.getAllByText('-');
      expect(resultItems.length).toBeGreaterThan(0);
    });
  });
});
