import { Card } from "@/ui/card/card";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">IA</h1>
        <p className="text-gray-600">Asistente inteligente para optimizar tu trabajo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Chat con IA" className="h-96">
          <div className="h-full flex flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-3">
                  <p className="text-sm">¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <input 
                type="text" 
                placeholder="Escribe tu mensaje..." 
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Enviar
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Funciones Rápidas">
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-xs font-medium">Escribir</p>
                </div>
              </button>
              
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-xs font-medium">Resumir</p>
                </div>
              </button>
              
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7H7z" />
                  </svg>
                  <p className="text-xs font-medium">Traducir</p>
                </div>
              </button>
              
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-xs font-medium">Optimizar</p>
                </div>
              </button>
            </div>
          </Card>

          <Card title="Historial de Consultas">
            <div className="space-y-3">
              {[1, 2, 3].map((query) => (
                <div key={query} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Consulta {query}</p>
                  <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
