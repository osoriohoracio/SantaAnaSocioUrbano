
export interface FormData {
  // 1. ENCUESTA DOMICILIARIA
  fecha: string;
  encuestador: string;
  zona_manzana: string;
  lote: string;

  // SECCIÓN A: IDENTIFICACIÓN DEL HOGAR
  nombre_referente: string;
  direccion: string;
  telefono: string;
  anos_residencia: string;
  cantidad_integrantes: string;

  // SECCIÓN B: COMPOSICIÓN FAMILIAR
  listado_integrantes: string;

  // SECCIÓN C: CONDICIONES DE VIVIENDA Y SERVICIOS
  tipo_vivienda: string;
  tenencia: string;
  agua_potable: string;
  energia_electrica: string;
  cloacas: string;
  recoleccion_residuos: string;
  gas: string;
  internet: string;

  // SECCIÓN D: PARTICIPACIÓN COMUNITARIA
  conoce_union_vecinal: string;
  participa_reuniones: string;
  participacion: string[];
  colaboracion_sum: string;
  forma_colaboracion: string;

  // SECCIÓN E: NECESIDADES Y PRIORIDADES DEL BARRIO
  problemas_barrio: string[];
  obra_urgente: string;

  // SECCIÓN F: OPINIÓN SOBRE EL SUM
  usos_sum: string[];
  necesidad_construccion_sum: string;
  comentarios_adicionales: string;

  // SECCIÓN G: CONSENTIMIENTO INFORMADO
  nombre_dni_vecino: string;
  firma_vecino: string;
  firma_encuestador: string;
}

export interface Option {
  value: string;
  label: string;
}
