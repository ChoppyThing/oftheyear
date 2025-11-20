export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card exemple */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Jeux</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">142</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">En attente</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">8</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Utilisateurs</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">1,234</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Contenu principal</h3>
        <p className="text-gray-600">Votre contenu ici...</p>
      </div>
    </div>
  );
}
