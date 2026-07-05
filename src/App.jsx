import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Truck, Package, User, Plus, Search, CheckCircle, 
  Clock, Printer, LogOut, ShieldAlert, FileText, ChevronRight
} from 'lucide-react';

// === KONEKSI DATABASE SUPABASE ===
const supabaseUrl = 'https://eowtwkqcuggzogzbsayn.supabase.co';
const supabaseKey = 'sb_publishable_IJLF4yMmEVoA-2NasjcPBA_tEaJclm_';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  // === STATE APLIKASI ===
  const [role, setRole] = useState(null); 
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State Data
  const [manifests, setManifests] = useState([]);
  const [newManifest, setNewManifest] = useState({ tujuan: '', supir: '', armada: '', resi: '' });

  // === FUNGSI FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('manifests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setManifests(data);
    } catch (err) {
      console.error("Error mengambil data:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (role) fetchData();
  }, [role]);

  // === FUNGSI LOGIN ===
  const handleLogin = (selectedRole) => {
    const validPins = {
      'admin': '1111',
      'gudang': '2222',
      'supir': '3333',
      'master': 'Kamil2026'
    };

    if (pinInput === validPins[selectedRole]) {
      setRole(selectedRole);
      setLoginError('');
      setPinInput('');
    } else {
      setLoginError('PIN atau Sandi salah!');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setPinInput('');
  };

  const handlePrint = () => {
    window.print();
  };

  // === FUNGSI ADMIN: BUAT MANIFEST ===
  const handleCreateManifest = async () => {
    if (!newManifest.tujuan || !newManifest.supir) return alert("Isi data tujuan dan supir!");
    
    setIsLoading(true);
    const idBaru = `MNF-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      const { error } = await supabase
        .from('manifests')
        .insert([{ 
          id: idBaru, 
          tujuan: newManifest.tujuan, 
          supir: newManifest.supir,
          armada: newManifest.armada,
          resi: newManifest.resi,
          status: 'PROSES' 
        }]);

      if (error) throw error;
      
      setNewManifest({ tujuan: '', supir: '', armada: '', resi: '' });
      await fetchData();
      alert("Manifest berhasil diterbitkan ke Cloud!");
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Terjadi kesalahan saat menyimpan ke Cloud.");
    }
    setIsLoading(false);
  };

  // === TAMPILAN 1: HALAMAN LOGIN ===
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-900 p-8 text-center relative cursor-pointer" onClick={() => setPinInput('Kamil2026')}>
            <Truck size={48} className="mx-auto text-white mb-4" />
            <h1 className="text-3xl font-bold text-white">Kamil Logistik</h1>
            <p className="text-blue-200 mt-2">Sistem Manajemen Ekspedisi Cloud</p>
          </div>
          
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-700 mb-6 text-center">Silakan Masuk ke Sistem</h2>
            
            <input 
              type="password" 
              placeholder="Masukkan PIN / Sandi..."
              className="w-full text-center text-2xl tracking-widest p-4 border-2 border-gray-200 rounded-xl mb-2 focus:border-blue-500 outline-none transition"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            {loginError && <p className="text-red-500 text-sm text-center mb-4 font-medium">{loginError}</p>}
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={() => handleLogin('admin')} className="bg-blue-50 p-4 rounded-xl flex flex-col items-center hover:bg-blue-100 transition border border-blue-100">
                <ShieldAlert className="text-blue-600 mb-2" />
                <span className="font-bold text-blue-900">Admin</span>
              </button>
              <button onClick={() => handleLogin('gudang')} className="bg-orange-50 p-4 rounded-xl flex flex-col items-center hover:bg-orange-100 transition border border-orange-100">
                <Package className="text-orange-600 mb-2" />
                <span className="font-bold text-orange-900">Gudang</span>
              </button>
              <button onClick={() => handleLogin('supir')} className="bg-green-50 p-4 rounded-xl flex flex-col items-center hover:bg-green-100 transition border border-green-100">
                <User className="text-green-600 mb-2" />
                <span className="font-bold text-green-900">Supir</span>
              </button>
              <button onClick={() => handleLogin('master')} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center hover:bg-slate-700 transition border border-slate-700">
                <FileText className="text-white mb-2" />
                <span className="font-bold text-white">Pemilik</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === TAMPILAN 2: DASHBOARD APLIKASI ===
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-10 print:hidden flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center">
            <Truck className="mr-2" size={20} /> Kamil Logistik
          </h1>
          <p className="text-xs text-blue-200 mt-1 capitalize">Role Akses: {role}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 p-2 rounded-lg flex items-center transition">
          <LogOut size={16} className="mr-1" /> Keluar
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
        {isLoading && (
          <div className="text-center py-4 text-blue-600 font-bold animate-pulse">
            Menyinkronkan data dengan Cloud...
          </div>
        )}

        {(role === 'admin' || role === 'master') && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 print:hidden">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3 mb-4 flex items-center">
              <Plus className="mr-2 text-blue-600" /> Buat Manifest Baru
            </h2>
            <div className="space-y-3">
              <input type="text" placeholder="Kota Tujuan" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white" value={newManifest.tujuan} onChange={e => setNewManifest({...newManifest, tujuan: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Nama Supir" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white" value={newManifest.supir} onChange={e => setNewManifest({...newManifest, supir: e.target.value})} />
                <input type="text" placeholder="Armada / Plat" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white" value={newManifest.armada} onChange={e => setNewManifest({...newManifest, armada: e.target.value})} />
              </div>
              <textarea placeholder="Nomor Resi (Pisahkan dengan koma)" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white" rows="2" value={newManifest.resi} onChange={e => setNewManifest({...newManifest, resi: e.target.value})}></textarea>
              <button onClick={handleCreateManifest} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700 transition">
                Terbitkan Surat Jalan
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-bold text-gray-600 mb-4 print:hidden">Data Manifest Aktif (Cloud)</h2>
          
          {manifests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 print:hidden">
              Belum ada data manifest saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {manifests.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl shadow border-l-4 border-blue-500 break-inside-avoid relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-xl text-gray-800">{m.id}</h3>
                      <p className="text-gray-500 font-medium">{m.tujuan}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${m.status === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {m.status || 'PROSES'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl mb-4">
                    <div>
                      <p className="text-gray-500 mb-1">Supir & Armada</p>
                      <p className="font-bold text-gray-800 flex items-center"><User size={14} className="mr-1"/> {m.supir}</p>
                      <p className="font-bold text-gray-800 flex items-center"><Truck size={14} className="mr-1"/> {m.armada}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Daftar Resi</p>
                      <p className="font-bold text-gray-800">{m.resi || 'Belum ada resi'}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-3 border-t print:hidden">
                    {(role === 'admin' || role === 'master') && (
                      <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white py-2.5 rounded-xl font-bold flex justify-center items-center hover:bg-gray-700 transition">
                        <Printer size={18} className="mr-2" /> Cetak / PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <div className="hidden print:block fixed bottom-10 w-full text-center text-sm text-gray-500">
        Dicetak dari Sistem Cloud Kamil Logistik - {new Date().toLocaleString('id-ID')}
      </div>
    </div>
  );
}
