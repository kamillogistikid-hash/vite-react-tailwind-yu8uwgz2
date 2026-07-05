import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Truck, Package, User, Plus, Search, CheckCircle, Clock, Printer, Download } from 'lucide-react';

const supabaseUrl = '[https://eowtwkqcuggzogzbsayn.supabase.co](https://eowtwkqcuggzogzbsayn.supabase.co)';
const supabaseKey = 'sb_publishable_IJLF4yMmEVoA-2NasjcPBA_tEaJclm_';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('manifest');
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('manifests').select('*');
      if (data) setManifests(data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6 flex justify-between items-center bg-blue-900 text-white p-4 rounded-xl shadow">
        <div>
          <h1 className="text-2xl font-bold">Kamil Logistik</h1>
          <p className="text-blue-200 text-sm">Sistem Pemantauan Resi Cloud</p>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-4"></div>
          Memuat data dari Cloud...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Daftar Manifest Aktif</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
              <Plus size={16} className="mr-1" /> Buat Baru
            </button>
          </div>

          {manifests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
              Belum ada manifest. Data akan tersinkron dari Cloud.
            </div>
          ) : (
            manifests.map((m) => (
              <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">Manifest: {m.id}</h3>
                    <p className="text-sm text-gray-600">Tujuan: {m.tujuan}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {m.status || 'PROSES'}
                  </span>
                </div>
                
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-50">
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center">
                    <Printer size={16} className="mr-2" /> Cetak
                  </button>
                  <button className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center">
                    <Download size={16} className="mr-2" /> Simpan sebagai PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
