import { Card } from "@/ui/card/card";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Plantillas reutilizables para mensajes y documentos</p>
        </div>
        <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors">
          Nuevo Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((template) => (
          <Card key={template} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Template {template}</h3>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Esta es una descripción del template que explica su propósito y uso...
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Creado hace 2 días</span>
                <span>Usado 15 veces</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
