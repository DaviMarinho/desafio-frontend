export interface Noticia {
  id: number;
  titulo: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticiaDto {
  titulo: string;
  descricao: string;
}

export interface UpdateNoticiaDto {
  titulo?: string;
  descricao?: string;
}
