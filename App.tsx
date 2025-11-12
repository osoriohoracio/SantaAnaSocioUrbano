
import React, { useState, useEffect } from 'react';
import type { FormData, Option } from './types';
import Fieldset from './components/Fieldset';
import FormField from './components/FormField';
import FormSelect from './components/FormSelect';
import FormTextarea from './components/FormTextarea';
import FormCheckboxGroup from './components/FormCheckboxGroup';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const App: React.FC = () => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fecha: new Date().toISOString().split('T')[0],
    encuestador: '',
    zona_manzana: '',
    lote: '',
    nombre_referente: '',
    direccion: '',
    telefono: '',
    anos_residencia: '',
    cantidad_integrantes: '',
    listado_integrantes: '',
    tipo_vivienda: 'casa',
    tenencia: 'propietario',
    agua_potable: 'red_publica',
    energia_electrica: 'con_medidor',
    cloacas: 'red_publica',
    recoleccion_residuos: 'si_diaria',
    gas: 'red',
    internet: 'fijo',
    conoce_union_vecinal: 'si',
    participa_reuniones: 'siempre',
    participacion: [],
    colaboracion_sum: 'si',
    forma_colaboracion: '',
    problemas_barrio: [],
    obra_urgente: 'construccion_sum',
    usos_sum: [],
    necesidad_construccion_sum: 'si',
    comentarios_adicionales: '',
    nombre_dni_vecino: '',
    firma_vecino: '',
    firma_encuestador: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (isPreviewing) {
      document.body.classList.add('print-preview');
    } else {
      document.body.classList.remove('print-preview');
    }
    return () => {
      document.body.classList.remove('print-preview');
    };
  }, [isPreviewing]);

  const validateForm = (): Partial<Record<keyof FormData, string>> => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.encuestador.trim()) newErrors.encuestador = 'El nombre del encuestador es requerido.';
    if (!formData.zona_manzana.trim()) newErrors.zona_manzana = 'La Zona/Manzana es requerida.';
    if (!formData.lote.trim()) newErrors.lote = 'El número de lote es requerido.';
    if (!formData.nombre_referente.trim()) newErrors.nombre_referente = 'El nombre del referente es requerido.';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida.';
    if (!formData.anos_residencia.trim()) newErrors.anos_residencia = 'Los años de residencia son requeridos.';
    if (!formData.cantidad_integrantes.trim()) newErrors.cantidad_integrantes = 'La cantidad de integrantes es requerida.';
    if (!formData.listado_integrantes.trim()) newErrors.listado_integrantes = 'El listado de integrantes es requerido.';
    if (!formData.nombre_dni_vecino.trim()) newErrors.nombre_dni_vecino = 'El nombre y DNI del vecino son requeridos.';
    if (!formData.firma_vecino.trim()) newErrors.firma_vecino = 'La firma del vecino es requerida.';
    if (!formData.firma_encuestador.trim()) newErrors.firma_encuestador = 'La firma del encuestador es requerida.';

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData, limit?: number) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentValues = (prev[field] as string[]) || [];
      let newValues;
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((item) => item !== value);
      }
      if (limit && newValues.length > limit) {
        newValues.shift();
      }
      return { ...prev, [field]: newValues };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      alert('Por favor, corrija los errores marcados en el formulario antes de enviar.');
      return;
    }
    setErrors({});
    console.log('Form Data Submitted:');
    console.log(JSON.stringify(formData, null, 2));
    alert('Formulario enviado! Revise la consola del navegador para ver los datos.');
  };

  const handleExportPdf = async () => {
    const formElement = document.querySelector<HTMLElement>('main.w-full.max-w-4xl');
    if (!formElement || isGeneratingPdf) return;

    setIsGeneratingPdf(true);

    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;

    if (!jsPDF || !html2canvas) {
      alert("La librería para generar PDF no está cargada. Por favor, intente de nuevo.");
      setIsGeneratingPdf(false);
      return;
    }
    
    const buttonsContainer = formElement.querySelector<HTMLElement>('.pdf-export-buttons');
    if (buttonsContainer) buttonsContainer.style.visibility = 'hidden';

    try {
      const canvas = await html2canvas(formElement, { scale: 2 });
      
      if (buttonsContainer) buttonsContainer.style.visibility = 'visible';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;
      const totalPDFHeight = pdfWidth * canvasAspectRatio;

      let position = 0;
      let heightLeft = totalPDFHeight;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPDFHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPDFHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('Relevamiento_Socio-Urbano.pdf');

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Ocurrió un error al generar el PDF.");
      if (buttonsContainer) buttonsContainer.style.visibility = 'visible';
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      {isPreviewing && (
        <div className="fixed top-0 left-0 right-0 bg-white p-3 shadow-lg z-50 flex justify-center items-center gap-4 border-b border-slate-300 no-print">
          <span className="font-semibold text-slate-800">Vista Previa de Impresión</span>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewing(false)}
            className="px-4 py-2 border border-transparent bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
          >
            Cerrar Vista Previa
          </button>
        </div>
      )}
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <main className="w-full max-w-4xl bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-2xl print:shadow-none">
          <header className="text-center mb-10 border-b border-slate-200 pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Fichas de Relevamiento Socio-Urbano Participativo
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Barrio Santa Ana (Tupungato)</p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <Fieldset title="1. Encuesta Domiciliaria (Diagnóstico Socio-Comunitario)">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField label="Fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
                <FormField label="Encuestador/a" name="encuestador" value={formData.encuestador} onChange={handleChange} error={errors.encuestador} />
                <FormField label="Zona/Manzana" name="zona_manzana" value={formData.zona_manzana} onChange={handleChange} error={errors.zona_manzana} />
                <FormField label="Lote N°" name="lote" value={formData.lote} onChange={handleChange} error={errors.lote} />
              </div>
            </Fieldset>

            <Fieldset title="Sección A: Identificación del Hogar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Apellido y Nombre del referente" name="nombre_referente" value={formData.nombre_referente} onChange={handleChange} error={errors.nombre_referente} />
                  <FormField label="Teléfono de contacto" name="telefono" value={formData.telefono} onChange={handleChange} error={errors.telefono} />
                  <FormField label="Dirección / Punto de referencia" name="direccion" value={formData.direccion} onChange={handleChange} error={errors.direccion} />
                  <FormField label="Años de residencia en el barrio" name="anos_residencia" type="number" value={formData.anos_residencia} onChange={handleChange} error={errors.anos_residencia} />
                  <FormField label="Cantidad total de integrantes" name="cantidad_integrantes" type="number" value={formData.cantidad_integrantes} onChange={handleChange} error={errors.cantidad_integrantes} />
              </div>
            </Fieldset>
            
            <Fieldset title="Sección B: Composición Familiar">
              <FormTextarea label="Listado de integrantes del hogar (nombre, vínculo, edad, nivel educativo, ocupación)" name="listado_integrantes" value={formData.listado_integrantes} onChange={handleChange} rows={5} error={errors.listado_integrantes} />
            </Fieldset>

            <Fieldset title="Sección C: Condiciones de Vivienda y Servicios">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect label="Tipo de vivienda" name="tipo_vivienda" value={formData.tipo_vivienda} onChange={handleChange} options={[{value: "casa", label: "Casa"}, {value: "prefabricada", label: "Prefabricada"}, {value: "rancho_precaria", label: "Rancho/Precaria"}, {value: "material_sin_terminar", label: "Material sin terminar"}, {value: "otro", label: "Otro"}]} />
                  <FormSelect label="Tenencia" name="tenencia" value={formData.tenencia} onChange={handleChange} options={[{value: "propietario", label: "Propietario"}, {value: "alquilado", label: "Alquilado"}, {value: "ocupante", label: "Ocupante (con/sin permiso)"}, {value: "otro", label: "Otro"}]} />
                  <FormSelect label="Agua potable" name="agua_potable" value={formData.agua_potable} onChange={handleChange} options={[{value: "red_publica", label: "Red pública"}, {value: "pozo", label: "Pozo"}, {value: "camion_cisterna", label: "Camión cisterna"}, {value: "no_tiene", label: "No tiene"}]} />
                  <FormSelect label="Energía eléctrica" name="energia_electrica" value={formData.energia_electrica} onChange={handleChange} options={[{value: "con_medidor", label: "Con medidor"}, {value: "conexion_compartida", label: "Conexión compartida"}, {value: "sin_conexion", label: "Sin conexión"}]} />
                  <FormSelect label="Cloacas" name="cloacas" value={formData.cloacas} onChange={handleChange} options={[{value: "red_publica", label: "Red pública"}, {value: "pozo_ciego", label: "Pozo ciego"}, {value: "letrina", label: "Letrina"}, {value: "no_tiene", label: "No tiene"}]} />
                  <FormSelect label="Recolección de residuos" name="recoleccion_residuos" value={formData.recoleccion_residuos} onChange={handleChange} options={[{value: "si_diaria", label: "Sí, diaria"}, {value: "si_esporadica", label: "Sí, esporádica"}, {value: "no_hay", label: "No hay"}]} />
                  <FormSelect label="Gas" name="gas" value={formData.gas} onChange={handleChange} options={[{value: "red", label: "Red"}, {value: "garrafa", label: "Garrafa"}, {value: "lena", label: "Leña"}, {value: "otro", label: "Otro"}]} />
                  <FormSelect label="Internet" name="internet" value={formData.internet} onChange={handleChange} options={[{value: "fijo", label: "Fijo"}, {value: "movil", label: "Móvil"}, {value: "no_tiene", label: "No tiene"}]} />
              </div>
            </Fieldset>
            
            <Fieldset title="Sección D: Participación Comunitaria">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormSelect label="¿Conoce la Unión Vecinal u organización del barrio?" name="conoce_union_vecinal" value={formData.conoce_union_vecinal} onChange={handleChange} options={[{value: 'si', label: 'Sí'}, {value: 'no', label: 'No'}]} />
                <FormSelect label="¿Participa en reuniones/actividades?" name="participa_reuniones" value={formData.participa_reuniones} onChange={handleChange} options={[{value: 'siempre', label: 'Siempre'}, {value: 'a_veces', label: 'A veces'}, {value: 'nunca', label: 'Nunca'}]} />
                <FormCheckboxGroup legend="¿Le gustaría participar en? (puede marcar varias)" name="participacion" checkedValues={formData.participacion} onChange={(e) => handleCheckboxChange(e, 'participacion')} options={[{value: 'talleres', label: 'Talleres'}, {value: 'deportes', label: 'Deportes'}, {value: 'apoyo_escolar', label: 'Apoyo escolar'}, {value: 'reuniones_vecinales', label: 'Reuniones vecinales'}, {value: 'fiestas', label: 'Fiestas'}, {value: 'ninguna', label: 'Ninguna'}]} />
                <FormSelect label="¿Colaboraría en el mantenimiento del SUM?" name="colaboracion_sum" value={formData.colaboracion_sum} onChange={handleChange} options={[{value: 'si', label: 'Sí'}, {value: 'no', label: 'No'}, {value: 'tal_vez', label: 'Tal vez'}]} />
                <FormTextarea label="¿De qué forma colaboraría?" name="forma_colaboracion" value={formData.forma_colaboracion} onChange={handleChange} rows={3} />
              </div>
            </Fieldset>
            
            <Fieldset title="Sección E: Necesidades y Prioridades del Barrio">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormCheckboxGroup legend="Problemas más importantes del barrio (marque hasta 3)" name="problemas_barrio" checkedValues={formData.problemas_barrio} onChange={(e) => handleCheckboxChange(e, 'problemas_barrio', 3)} options={[{value: 'falta_espacios_comunitarios', label: 'Falta de espacios comunitarios'}, {value: 'calles_mal_estado', label: 'Calles en mal estado / Falta de veredas'}, {value: 'falta_alumbrado', label: 'Falta de alumbrado público'}, {value: 'inseguridad', label: 'Inseguridad'}, {value: 'recoleccion_residuos', label: 'Recolección de residuos'}, {value: 'problemas_agua_cloacas', label: 'Problemas con agua/cloacas'}, {value: 'faltas_espacios_verdes', label: 'Falta de espacios verdes'}, {value: 'desempleo', label: 'Desempleo'}, {value: 'otro', label: 'Otro'}]} />
                <FormSelect label="Obra más urgente para el barrio" name="obra_urgente" value={formData.obra_urgente} onChange={handleChange} options={[{value: 'construccion_sum', label: 'Construcción del SUM'}, {value: 'mejorar_calles', label: 'Mejorar las calles'}, {value: 'instalar_alumbrado', label: 'Instalar alumbrado público'}, {value: 'crear_plaza', label: 'Crear plaza/espacio verde'}, {value: 'mejorar_agua', label: 'Mejorar servicio de agua'}, {value: 'otro', label: 'Otro'}]} />
              </div>
            </Fieldset>
            
            <Fieldset title="Sección F: Opinión sobre el SUM">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormCheckboxGroup legend="Usos prioritarios del SUM (marque hasta 2)" name="usos_sum" checkedValues={formData.usos_sum} onChange={(e) => handleCheckboxChange(e, 'usos_sum', 2)} options={[{value: 'reuniones_vecinales', label: 'Reuniones vecinales y asambleas'}, {value: 'talleres_oficios', label: 'Talleres de oficios'}, {value: 'actividades_deportivas', label: 'Actividades deportivas'}, {value: 'espacio_nios', label: 'Espacio para niños'}, {value: 'fiestas_eventos', label: 'Fiestas y eventos comunitarios'}, {value: 'centro_salud', label: 'Centro de salud'}, {value: 'otro', label: 'Otro'}]} />
                <div>
                  <FormSelect label="¿Cree necesaria la construcción del SUM?" name="necesidad_construccion_sum" value={formData.necesidad_construccion_sum} onChange={handleChange} options={[{value: 'si', label: 'Sí'}, {value: 'no', label: 'No'}, {value: 'no_sabe', label: 'No sabe'}]} />
                  <div className="mt-6">
                    <FormTextarea label="Comentarios o sugerencias adicionales" name="comentarios_adicionales" value={formData.comentarios_adicionales} onChange={handleChange} rows={5} />
                  </div>
                </div>
              </div>
            </Fieldset>
            
            <Fieldset title="Sección G: Consentimiento Informado">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Nombre y DNI del vecino/a" name="nombre_dni_vecino" value={formData.nombre_dni_vecino} onChange={handleChange} error={errors.nombre_dni_vecino} />
                  <FormField label="Firma del vecino/a" name="firma_vecino" value={formData.firma_vecino} onChange={handleChange} placeholder="Escriba el nombre para firmar" error={errors.firma_vecino} />
                  <FormField label="Firma del encuestador/a" name="firma_encuestador" value={formData.firma_encuestador} onChange={handleChange} placeholder="Escriba el nombre para firmar" error={errors.firma_encuestador} />
              </div>
            </Fieldset>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-end gap-4 no-print pdf-export-buttons">
               <button
                type="button"
                onClick={() => setIsPreviewing(true)}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                Vista Previa
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                Imprimir
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? 'Generando...' : 'Exportar a PDF'}
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 border border-transparent bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                Enviar Formulario
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default App;