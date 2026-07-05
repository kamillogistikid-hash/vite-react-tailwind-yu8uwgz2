import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Truck, Package, User, Plus, CheckCircle, 
  Printer, LogOut, ShieldAlert, FileText, Camera
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

  const [manifests, setManifests] = useState([]);
  const [newManifest, setNewManifest] = useState({ tujuan: '', supir: '', armada: '', resi: '' });

  // === FUNGSI MENGAMBIL DATA DARI CLOUD ===
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

    if (pinInput.trim() === validPins[selectedRole]) {
      setRole(selectedRole);
      setLoginError('');
      setPinInput('');
    } else {
      setLoginError('Sandi salah! Ketik sandi dulu di kolom, baru klik kotaknya.');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setPinInput('');
  };

  // === FUNGSI ADMIN: BUAT SURAT JALAN ===
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
          status: 'PROSES MUAT' 
        }]);

      if (error) throw error;
      
      setNewManifest({ tujuan: '', supir: '', armada: '', resi: '' });
      await fetchData();
      alert("Surat Jalan berhasil diterbitkan!");
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Terjadi kesalahan saat menyimpan ke Cloud.");
    }
    setIsLoading(false);
  };

  // === FUNGSI GUDANG & SUPIR: UPDATE STATUS ===
  const updateStatus = async (id, statusBaru) => {
    setIsLoading(true);
    try {
      let updateData = { status: statusBaru };
      
      // Jika Supir klik Tiba, bisa tambah link dokumentasi (opsional)
      if (statusBaru === 'DITERIMA CUSTOMER') {
        const linkDokumentasi = prompt("Masukkan link foto dokumentasi (Opsional, boleh dikosongkan lalu klik OK):");
        if (linkDokumentasi) {
          const manifestSaatIni = manifests.find(m => m.id === id);
          updateData.resi = manifestSaatIni.resi + ` | DOKUMENTASI: ${linkDokumentasi}`;
        }
      }

      const { error } = await supabase
        .from('manifests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("Gagal update status: " + err.message);
    }
    setIsLoading(false);
  };

  // === TAMPILAN 1: HALAMAN LOGIN ===
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-900 p-8 text-center relative">
            <Truck size={48} className="mx-auto text-white mb-4" />
            <h1 className="text-3xl font-bold text-white">Kamil Logistik</h1>
            <p className="text-blue-200 mt-2">Sistem Monitoring Terpadu</p>
          </div>
          
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-700 mb-6 text-center">Silakan Masuk ke Sistem</h2>
            
            <input 
              type="password" 
              placeholder="Ketik Sandi Di Sini..."
              className="w-full text-center text-2xl tracking-widest p-4 border-2 border-gray-200 rounded-xl mb-2 focus:border-blue-500 outline-none transition"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            {loginError && <p className="text-red-500 text-sm text-center mb-4 font-medium">{loginError}</p>}
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={() => handleLogin('admin')} className="bg-blue-50 p-4 rounded-xl flex flex-col items-center hover:bg-blue-100 transition border border-blue-100 shadow-sm">
                <ShieldAlert className="text-blue-600 mb-2" />
                <span className="font-bold text-blue-900">Admin</span>
              </button>
              <button onClick={() => handleLogin('gudang')} className="bg-orange-50 p-4 rounded-xl flex flex-col items-center hover:bg-orange-100 transition border border-orange-100 shadow-sm">
                <Package className="text-orange-600 mb-2" />
                <span className="font-bold text-orange-900">Gudang</span>
              </button>
              <button onClick={() => handleLogin('supir')} className="bg-green-50 p-4 rounded-xl flex flex-col items-center hover:bg-green-100 transition border border-green-100 shadow-sm">
                <User className="text-green-600 mb-2" />
                <span className="font-bold text-green-900">Supir</span>
              </button>
              <button onClick={() => handleLogin('master')} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center hover:bg-slate-700 transition border border-slate-700 shadow-sm">
                <FileText className="text-white mb-2" />
                <span className="font-bold text-white">Pemilik</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === TAMPILAN 2: DASHBOARD UTAMA ===
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-10 print:hidden flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center">
            <Truck className="mr-2" size={20} /> Kamil Logistik
          </h1>
          <p className="text-xs text-blue-200 mt-1 capitalize">Akses Anda: {role}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center transition font-bold shadow">
          <LogOut size={16} className="mr-2" /> Keluar
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
        {isLoading && (
          <div className="text-center py-4 text-blue-600 font-bold animate-pulse">
            Menyinkronkan data dengan Cloud...
          </div>
        )}

        {/* Form Pembuatan Manifest - Hanya Admin/Pemilik */}
        {(role === 'admin' || role === 'master') && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 print:hidden">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3 mb-4 flex items-center">
              <Plus className="mr-2 text-blue-600" /> Buat Surat Jalan Baru
            </h2>
            <div className="space-y-3">
              <input type="text" placeholder="Kota Tujuan (Cth: Makassar)" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={newManifest.tujuan} onChange={e => setNewManifest({...newManifest, tujuan: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Nama Supir" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none" value={newManifest.supir} onChange={e => setNewManifest({...newManifest, supir: e.target.value})} />
                <input type="text" placeholder="Armada / Plat" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none" value={newManifest.armada} onChange={e => setNewManifest({...newManifest, armada: e.target.value})} />
              </div>
              <textarea placeholder="Masukkan Nomor Resi (Pisahkan dengan koma)" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none" rows="2" value={newManifest.resi} onChange={e => setNewManifest({...newManifest, resi: e.target.value})}></textarea>
              <button onClick={handleCreateManifest} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700 transition">
                Terbitkan ke Sistem Cloud
              </button>
            </div>
          </div>
        )}

        {/* Daftar Data Cloud */}
        <div>
          <h2 className="font-bold text-gray-600 mb-4 print:hidden">Monitoring Pengiriman</h2>
          
          {manifests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 print:hidden">
              Belum ada pergerakan barang saat ini.
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
                    <span className={`px-4 py-1.5 text-sm font-bold rounded-full text-center
                      ${m.status === 'DITERIMA CUSTOMER' ? 'bg-green-100 text-green-700' : 
                        m.status === 'DALAM PENGIRIMAN' ? 'bg-blue-100 text-blue-700' : 
                        'bg-orange-100 text-orange-700'}`}>
                      {m.status || 'PROSES MUAT'}
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
                      <p className="font-bold text-gray-800">{m.resi ? m.resi.split(' | DOKUMENTASI:')[0] : 'Belum ada resi'}</p>
                    </div>
                  </div>

                  {m.resi && m.resi.includes(' | DOKUMENTASI:') && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center print:hidden">
                      <Camera className="text-blue-600 mr-2" size={18} />
                      <a href={m.resi.split(' | DOKUMENTASI:')[1]} target="_blank" rel="noreferrer" className="text-blue-700 font-bold hover:underline text-sm break-all">
                        Lihat Bukti Dokumentasi Penerimaan
                      </a>
                    </div>
                  )}

                  {/* Tombol Aksi Berdasarkan Role */}
                  <div className="flex flex-wrap gap-3 pt-3 border-t print:hidden">
                    {(role === 'admin' || role === 'master') && (
                      <button onClick={() => window.print()} className="flex-1 min-w-[120px] bg-gray-800 text-white py-2.5 rounded-xl font-bold flex justify-center items-center hover:bg-gray-700 transition">
                        <Printer size={18} className="mr-2" /> Cetak PDF
                      </button>
                    )}
                    
                    {role === 'gudang' && m.status !== 'DITERIMA CUSTOMER' && (
                      <button onClick={() => updateStatus(m.id, 'DALAM PENGIRIMAN')} className="flex-1 min-w-[120px] bg-orange-500 text-white py-2.5 rounded-xl font-bold flex justify-center items-center hover:bg-orange-600 transition shadow">
                        <Package size={18} className="mr-2" /> Selesai Muat
                      </button>
                    )}

                    {role === 'supir' && m.status !== 'DITERIMA CUSTOMER' && (
                      <button onClick={() => updateStatus(m.id, 'DITERIMA CUSTOMER')} className="flex-1 min-w-[120px] bg-green-500 text-white py-2.5 rounded-xl font-bold flex justify-center items-center hover:bg-green-600 transition shadow">
                        <CheckCircle size={18} className="mr-2" /> Tiba & Selesai
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
        Dokumen Resmi Kamil Logistik - Dicetak pada {new Date().toLocaleString('id-ID')}
      </div>
    </div>
  );
}
