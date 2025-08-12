import { Card } from "@/ui/card/card";

export default function MyChatsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Mis Chats</h1>
        <p className="text-gray-600">Conversaciones privadas y personales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Chats Privados">
            <div className="space-y-3">
              {[1, 2, 3].map((chat) => (
                <div key={chat} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                    U{chat}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Usuario {chat}</h3>
                    <p className="text-sm text-gray-500">Hola, ¿cómo estás?</p>
                  </div>
                  <div className="text-xs text-gray-400">Ayer</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Iniciar Conversación">
            <div className="space-y-4">
              <button className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">Nuevo Chat Privado</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
