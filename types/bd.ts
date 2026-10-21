interface User {
  id: string;
  nome: string;
  email: string;
  role: 'EDITOR' | 'ADMIN';
  habilitado: boolean;
}

interface Cargo {
  id: number;
  cargo: string;
  relacao_pessoa_cargo: RelacPessoaCargo[];
}

interface RelacPessoaCargo {
  id: number;
  id_cargo: number;
  cargo: Cargo;
  pessoa: Pessoa;
  id_pessoa: number;
  data_cargo: Date;
  ano: number;
}

interface Pessoa {
  id: number;
  nome: string;
  id_pais?: number;
  id_titulo_nobreza?: number;
  relacao_pessoa_cargo: RelacPessoaCargo[];
  pais?: Pais;
  titulo_nobreza?: TituloNobreza;
  relacao_embarcacao_proprietario: RelacEmbarcacaoProprietario[];
  mestre: Viagem[];
  capitao: Viagem[];
  comandante: Viagem[];
  armador: Viagem[];
  consignatario: Viagem[];
  minibiografia: minibiografia;
  relac_mercadoria_viagem: RelacMercadoriaViagem[];
}

interface Embarcacao {
  id: number;
  id_tipo_embarcacao: number;
  id_pais: string;
  nome: string;
  observacao: string | null;
  tipo_embarcacao: TipoEmbarcacao;
  relacao_embarcacao_proprietario: RelacEmbarcacaoProprietario[];
  viagem: Viagem[];
  pais: Pais;
}

interface TipoEmbarcacao {
  id: number;
  texto_descritivo: string;
  tipo: string;
  embarcacao: Embarcacao[];
  imagem_embarcacao: ImagemEmbarcacao[];
}

interface ImagemEmbarcacao {
  id: number;
  imagem: string;
  id_tipo_embarcacao: number;
  tipo_embarcacao: TipoEmbarcacao;
}

interface Porto {
  id: number;
  nome: string;
  id_pais: number;
  pais: Pais;
  viagem_origem: Viagem[];
  viagem_destino: Viagem[];
  escala: Escala[];
}

interface Pais {
  id: number;
  nome: string;
  gentilico: string;
  porto: Porto[];
  pessoa: Pessoa[];
  relacao_embarcacao_proprietario: RelacEmbarcacaoProprietario[];
  embarcacao: Embarcacao[];
}

interface TituloNobreza {
  id: number;
  titulo: string;
  pessoa: Pessoa[];
}

interface RelacEmbarcacaoProprietario {
  id: number;
  id_embarcacao: number;
  id_proprietario: number;
  data_inicio: Date;
  data_fim: Date;
  id_pais: number;
  embarcacao: Embarcacao;
  pais: Pais;
  pessoa: Pessoa;
}

interface Viagem {
  id: number;
  id_embarcacao: number;
  id_porto_origem: number;
  id_porto_destino: number;
  data_viagem: Date;
  dias_porto_destino: number;
  dias_porto_origem: number;
  mestre_id: number;
  capitao_id: number;
  comandante_id: number;
  entrada_saida: string;
  dias_viagem: number;
  data_chegada: Date;
  data_rio: Date;
  id_consignatario: number;
  armador_id: number;
  relac_viagem_referencia_doc: RelacViagemReferenciaDoc[];
  noticia: Noticia[];
  relac_mercadoria_viagem: RelacMercadoriaViagem[];
  escala: Escala[];
  consignatario: Pessoa;
  embarcacao: Embarcacao;
  porto_origem: Porto;
  porto_destino: Porto;
  mestre: Pessoa;
  capitao: Pessoa;
  comandante: Pessoa;
  armador: Pessoa;
  arriba: Arriba[];
  passageiro: Passageiro[];
}

interface Escala {
  id: number;
  id_viagem: number;
  id_porto: number;
  porto?: Porto;
  viagem?: Viagem;
  relac_mercadoria_escala?: RelacMercadoriaEscala[];
}

interface Mercadoria {
  id: number;
  nome: string;
  relac_mercadoria_viagem: RelacMercadoriaViagem[];
  relac_mercadoria_escala: RelacMercadoriaEscala[];
}

interface UnidadeDeMedida {
  id: number;
  unidade_medida: string;
  relac_mercadoria_viagem: RelacMercadoriaViagem[];
  relac_mercadoria_escala: RelacMercadoriaEscala[];
}

interface Noticia {
  id: number;
  id_viagem: number;
  assunto: string;
  viagem: Viagem;
}

interface RelacViagemReferenciaDoc {
  id: number;
  id_referencia_documental: number;
  id_viagem: number;
  data_publicacao: Date;
  referencia_documental: ReferenciaDocumental;
  viagem: Viagem;
}

interface ReferenciaDocumental {
  id: number;
  nome_periodico: string;
  relacao_viagem_referencia_doc: RelacViagemReferenciaDoc[];
}

interface RelacMercadoriaEscala {
  id: number;
  id_escala: number;
  id_mercadoria: number;
  quantidade: number;
  movimento: string;
  cosignatario: Pessoa;
  valor_frete: number;
  id_unidade_medida: number;
  unidade_de_medida: UnidadeDeMedida;
  mercadoria: Mercadoria;
  escala: Escala;
}

interface RelacMercadoriaViagem {
  id: number;
  id_viagem: number;
  id_mercadoria: number;
  quantidade_origem: number;
  valor_frete: number;
  cosignatario: Pessoa;
  id_unidade_medida: number;
  viagem: Viagem[];
  mercadoria: Mercadoria;
  unidade_de_medida: UnidadeDeMedida;
  pessoa: Pessoa;
}

interface minibiografia {
  id: number;
  id_pessoa: number;
  biografia: string;
  pessoa: Pessoa;
}

interface TipoPassageiro {
  id: number;
  tipo: string;
  passageiro: Passageiro[];
}

interface Passageiro {
  id: number;
  id_tipo_passageiro: number;
  id_viagem: number;
  total: number;
  observacoes: string;
  viagem: Viagem;
  tipo_passageiro: TipoPassageiro;
}

interface Arriba {
  id: number;
  id_viagem: number;
  observacoes: string;
  viagem: Viagem;
}
