import api from './api';
import { Noticia, CreateNoticiaDto, UpdateNoticiaDto } from '../types/Noticia';

interface ListarNoticiasParams {
  page?: number;
  perPage?: number;
  q?: string; // Search query
}

/**
 * Lista notícias com paginação e busca
 */
export const listarNoticias = async (params: ListarNoticiasParams = {}) => {
  const { page = 1, perPage = 10, q } = params;

  // Se houver busca, buscar todas as notícias e filtrar no client-side
  // (json-server 1.0 beta não suporta bem o parâmetro q)
  if (q && q.trim()) {
    const response = await api.get<Noticia[]>('/noticias?_sort=createdAt&_order=desc');
    const allNoticias = response.data;

    // Filtrar por título ou descrição (case insensitive)
    const searchLower = q.toLowerCase();
    const filtered = allNoticias.filter(
      (noticia) =>
        noticia.titulo.toLowerCase().includes(searchLower) ||
        noticia.descricao.toLowerCase().includes(searchLower)
    );

    // Aplicar paginação manual
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = filtered.slice(start, end);

    return {
      data: paginatedData,
      total: filtered.length,
      page,
      perPage,
    };
  }

  // Sem busca, usar paginação do servidor
  const queryParams = new URLSearchParams({
    _page: page.toString(),
    _limit: perPage.toString(),
    _sort: 'createdAt',
    _order: 'desc',
  });

  const response = await api.get<Noticia[]>(`/noticias?${queryParams.toString()}`);

  // json-server returns total count in X-Total-Count header
  const total = parseInt(response.headers['x-total-count'] || '0', 10);

  return {
    data: response.data,
    total,
    page,
    perPage,
  };
};

/**
 * Busca uma notícia específica por ID
 */
export const buscarNoticia = async (id: number): Promise<Noticia> => {
  const response = await api.get<Noticia>(`/noticias/${id}`);
  return response.data;
};

/**
 * Cria uma nova notícia
 */
export const criarNoticia = async (data: CreateNoticiaDto): Promise<Noticia> => {
  const noticiaData = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const response = await api.post<Noticia>('/noticias', noticiaData);
  return response.data;
};

/**
 * Atualiza uma notícia existente
 */
export const atualizarNoticia = async (
  id: number,
  data: UpdateNoticiaDto
): Promise<Noticia> => {
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const response = await api.patch<Noticia>(`/noticias/${id}`, updateData);
  return response.data;
};

/**
 * Deleta uma notícia
 */
export const deletarNoticia = async (id: number): Promise<void> => {
  await api.delete(`/noticias/${id}`);
};
