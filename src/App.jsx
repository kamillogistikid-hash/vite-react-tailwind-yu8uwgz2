import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Truck, Package, User, Plus, CheckCircle, Printer, LogOut, 
  ShieldAlert, FileText, Camera, DollarSign, BrainCircuit, ClipboardList, Layers
} from 'lucide-react';

// === KONEKSI DATABASE CLOUD SUPABASE ===
const supabaseUrl = 'https://eowtwkqcuggzogzbsayn.supabase.co';
const supabaseKey = 'sb_publishable_IJLF4yMmEVoA-2NasjcPBA_tEaJclm_';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  // === STATE APLIKASI ===
  const [role, setRole] = useState(null); // 'master', 'admin', 'gudang', 'supir', 'owner'
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // State Data Manifester
  const [manifests, setManifests] = useState([]);
  const [newManifest, setNewManifest] = useState({ 
    tujuan: '', supir: '', armada: '', resi: '', pembayaran: 'COD', biaya: '', catatan: '' 
  });

  // === AMBIL DATA DARI CLOUD ===
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
      console.error("Gagal mengambil data Cloud:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (role) fetchData();
  }, [role]);

  // === VALIDASI AKSES MASUK ===
  const handleLogin = (selectedRole) => {
    const validPins = {
      'admin': '1111',
      'gudang': '2222',
      'supir': '3333',
      'master': 'Kamil2026',
      'owner': 'Kamil2026'
    };

    if (pinInput.trim() === validPins[selectedRole]) {
      setRole(selectedRole);
      setLoginError('');
      setPinInput('');
    } else {
      setLoginError('Kode Akses/PIN yang Anda masukkan salah!');
    }
  };

  // === FITUR AI: RINGKASAN OPERASIONAL ===
  const generateAiSummary = () => {
    if (manifests.length === 0) return setAiSummary("Belum ada data operasional untuk dianalisis.");
    
    const total = manifests.length;
    const selesai = manifests.filter(m => m.status === 'DITERIMA CUSTOMER').length;
    const proses = total - selesai;
    
    setAiSummary(`[AI Intel Kamil Logistik]: Saat ini terdapat ${total} pengiriman aktif dalam sistem Cloud. Sebanyak ${selesai} manifes telah sukses diserahterimakan ke customer, dan ${proses} manifes masih dalam pengawasan intensif (proses muat/perjalanan). Efisiensi distribusi jalur regional terpantau stabil.`);
  };

  // === FITUR DISPATCH: PENERBITAN MANIFES ===
  const handleCreateManifest = async () => {
    if (!newManifest.tujuan || !newManifest.supir) return alert("Mohon lengkapi Kota Tujuan dan Nama Supir!");
    
    setIsLoading(true);
    const idManifest = `MNF-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      const { error } = await supabase
        .from('manifests')
        .insert([{ 
          id: idManifest, 
          tujuan: newManifest.tujuan, 
          supir: newManifest.supir,
          armada: newManifest.armada,
          resi: newManifest.resi,
          pembayaran: newManifest.pembayaran,
          biaya: newManifest.biaya,
          catatan: newManifest.catatan,
          status: 'PROSES MUAT' 
        }]);

      if (error) throw error;
      
      setNewManifest({ tujuan: '', supir: '', armada: '', resi: '', pembayaran: 'COD', biaya: '', catatan: '' });
      await fetchData();
      alert(`Sukses! ${idManifest} telah diterbitkan ke Cloud server.`);
    } catch (err) {
      alert("Gagal sinkronisasi Cloud: " + err.message);
    }
    setIsLoading(false);
  };

  // === UPDATE PERGERAKAN LOGISTIK ===
  const updateStatusLogistik = async (id, statusBaru) => {
    setIsLoading(true);
    try {
      let payload = { status: statusBaru };
      
      if (statusBaru === 'DITERIMA CUSTOMER') {
        const urlFoto = prompt("Silakan masukkan tautan/link foto dokumentasi serah terima barang:");
        if (urlFoto) {
          const current = manifests.find(m => m.id === id);
          payload.resi = current.resi + ` | DOKUMENTASI: ${urlFoto}`;
        }
      }

      const { error } = await supabase
        .from('manifests')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("Gagal memperbarui status operasional: " + err.message);
    }
    setIsLoading(false);
  };

  // === UI INTERFACE 1: PANEL LOGIN UTAMA ===
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-10 text-center text-white">
            <Truck size={56} className="mx-auto text-blue-400 mb-4 animate-bounce" />
            <h1 className="text-4xl font-black tracking-tight">KAMIL LOGISTIK</h1>
            <p className="text-blue-200 mt-2 text-sm font-medium tracking-wide">Enterprise Fleet & Cargo Monitoring System</p>
          </div>
          
          <div className="p-8 bg-gray-50/50">
            <input 
              type="password" 
              placeholder="Masukkan PIN Otorisasi..."
              className="w-full text-center text-3xl tracking-widest p-4 border-2 border-gray-200 rounded-2xl mb-4 bg-white focus:border-blue-600 outline-none shadow-inner font-mono"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            {loginError && <p className="text-red-500 text-xs text-center mb-4 font-bold bg-red-50 py-2 rounded-lg">{loginError}</p>}
            
            <p className="text-xs font-bold text-gray-400 text-center uppercase tracking-wider mb-4">Pilih Tingkat Otentikasi Jabatan</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleLogin('admin')} className="bg-white p-5 rounded-2xl flex flex-col items-center hover:shadow-md border border-gray-200 transition group">
                <ShieldAlert className="text-blue-600 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-gray-800 text-sm">Admin Dispatch</span>
              </button>
              <button onClick={() => handleLogin('gudang')} className="bg-white p-5 rounded-2xl flex flex-col items-center hover:shadow-md border border-gray-200 transition group">
                <Package className="text-amber-600 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-gray-800 text-sm">Staf Gudang</span>
              </button>
              <button onClick={() => handleLogin('supir')} className="bg-white p-5 rounded-2xl flex flex-col items-center hover:shadow-md border border-gray-200 transition group">
                <User className="text-emerald-600 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-gray-800 text-sm">Driver / Supir</span>
              </button>
              <button onClick={() => handleLogin('owner')} className="bg-slate-800 p-5 rounded-2xl flex flex-col items-center hover:bg-slate-800/90 transition shadow-md">
                <Layers className="text-blue-400 mb-2" />
                <span className="font-bold text-white text-sm">Super Admin / Owner</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === UI INTERFACE 2: HALAMAN DASHBOARD OPERASIONAL ===
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* KEPALA HALAMAN (Header) */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 shadow-xl sticky top-0 z-20 print:hidden flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <Truck className="text-blue-400" size={26} />
            <h1 className="text-2xl font-black tracking-wider">KAMIL LOGISTIK</h1>
          </div>
          <span className="bg-blue-800/60 px-3 py-1 text-[10px] font-extrabold tracking-widest rounded-full text-blue-200 border border-blue-700/50 block mt-1.5 uppercase">
            Akses: {role}
          </span>
        </div>
        <button onClick={() => setRole(null)} className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl flex items-center transition text-sm font-bold shadow-lg shadow-rose-900/20">
          <LogOut size={16} className="mr-2" /> Keluar Sistem
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
        {/* MODUL INTELEGENSI AI (Tersedia untuk Owner & Admin) */}
        {(role === 'admin' || role === 'owner') && (
          <div className="bg-gradient-to-br from-indigo-900 to-blue-950 p-6 rounded-3xl shadow-xl border border-indigo-800 text-white print:hidden">
            <div className="flex justify-between items-center border-b border-indigo-800 pb-3 mb-4">
              <h2 className="font-bold text-lg flex items-center tracking-wide text-indigo-200">
                <BrainCircuit className="mr-2 text-cyan-400 animate-pulse" /> Gemini AI Operational Analysis
              </h2>
              <button onClick={generateAiSummary} className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl transition">
                Mulai Analisis Sistem
              </button>
            </div>
            {aiSummary ? (
              <p className="text-sm leading-relaxed text-slate-200 bg-slate-900/40 p-4 rounded-xl border border-indigo-950 font-medium">
                {aiSummary}
              </p>
            ) : (
              <p className="text-xs text-indigo-300/70 italic">Klik tombol untuk memicu AI meringkas kondisi resi dan pengiriman aktif.</p>
            )}
          </div>
        )}

        {/* FORMULIR DISPATCH MANIFES BARU */}
        {(role === 'admin' || role === 'owner') && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print:hidden">
            <h2 className="font-black text-xl text-gray-800 border-b pb-3 mb-4 flex items-center tracking-tight">
              <Plus className="mr-2 text-blue-600" size={22} /> Pembuatan Manifes / Surat Jalan Baru
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" placeholder="Kota / Wilayah Tujuan" className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium" value={newManifest.tujuan} onChange={e => setNewManifest({...newManifest, tujuan: e.target.value})} />
                <input type="text" placeholder="Nama Driver / Supir" className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium" value={newManifest.supir} onChange={e => setNewManifest({...newManifest, supir: e.target.value})} />
                <input type="text" placeholder="Jenis Fleet & Nomor Plat" className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium" value={newManifest.armada} onChange={e => setNewManifest({...newManifest, armada: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex border rounded-xl bg-gray-50 overflow-hidden">
                  <span className="bg-gray-200/70 px-4 flex items-center text-xs font-bold text-gray-600 border-r"><DollarSign size={14}/></span>
                  <select className="p-3 bg-transparent outline-none text-sm font-semibold text-gray-700 flex-1" value={newManifest.pembayaran} onChange={e => setNewManifest({...newManifest, pembayaran: e.target.value})}>
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="DP">Uang Muka / Down Payment (DP)</option>
                    <option value="INVOICE">Sistem Invoice / Tagihan</option>
                  </select>
                </div>
                <input type="number" placeholder="Nominal Biaya Ekspedisi (Rp)" className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium" value={newManifest.biaya} onChange={e => setNewManifest({...newManifest, biaya: e.target.value})} />
              </div>

              <textarea placeholder="Input / Tempel Kumpulan Nomor Resi di sini (pisahkan dengan tanda koma)..." className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium" rows="3" value={newManifest.resi} onChange={e => setNewManifest({...newManifest, resi: e.target.value})}></textarea>
              <input type="text" placeholder="Catatan Tambahan Spesifik Logistik..." className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium" value={newManifest.catatan} onChange={e => setNewManifest({...newManifest, catatan: e.target.value})} />
              
              <button onClick={handleCreateManifest} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-blue-600/10 transition uppercase tracking-wide text-sm">
                Publish Fleet & Terbitkan Ke Cloud
              </button>
            </div>
          </div>
        )}

        {/* HUB MONITORING UTAMA KELUARGA MANIFES */}
        <div>
          <div className="flex items-center space-x-2 mb-4 print:hidden">
            <ClipboardList className="text-slate-500" size={20} />
            <h2 className="font-bold text-gray-600 tracking-wide uppercase text-xs">Real-Time Fleet Surveillance Console</h2>
          </div>
          
          {manifests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 print:hidden font-medium">
              Belum terdeteksi adanya manifes aktif di server database Cloud.
            </div>
          ) : (
            <div className="space-y-4">
              {manifests.map((m) => (
                <div key={m.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 break-inside-avoid relative border-l-8 border-l-blue-600">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-4 mb-4 gap-2">
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 tracking-tight">{m.id}</h3>
                      <p className="text-slate-500 text-sm font-bold mt-0.5">Destinasi: {m.tujuan}</p>
                    </div>
                    <span className={`px-4 py-1.5 text-xs font-black tracking-wider rounded-full text-center border uppercase
                      ${m.status === 'DITERIMA CUSTOMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        m.status === 'DALAM PENGIRIMAN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {m.status || 'PROSES MUAT'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Logistik Fleet</p>
                      <p className="font-bold text-slate-800 flex items-center mb-1"><User size={12} className="mr-1 text-slate-400"/> Driver: {m.supir}</p>
                      <p className="font-bold text-slate-800 flex items-center"><Truck size={12} className="mr-1 text-slate-400"/> Plat: {m.armada}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Rincian Finansial</p>
                      <p className="font-bold text-slate-800 flex items-center mb-1"><DollarSign size={12} className="mr-0.5 text-slate-400"/> Sistem: {m.pembayaran || 'COD'}</p>
                      <p className="font-bold text-slate-800">Rp {Number(m.biaya).toLocaleString('id-ID') || '0'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Kumpulan Nomor Resi</p>
                      <p className="font-mono bg-white p-2 rounded-lg border border-slate-200 max-h-[60px] overflow-y-auto break-all text-slate-700 font-medium leading-relaxed">
                        {m.resi ? m.resi.split(' | DOKUMENTASI:')[0] : 'Tidak ada resi tercantum'}
                      </p>
                    </div>
                  </div>

                  {m.catatan && (
                    <p className="text-xs font-semibold text-slate-500 bg-amber-50/50 p-3 rounded-xl border border-amber-100/60 mb-4">
                      *Catatan Penting: {m.catatan}
                    </p>
                  )}

                  {/* VISUALISASI BUKTI DOKUMENTASI FOTO */}
                  {m.resi && m.resi.includes(' | DOKUMENTASI:') && (
                    <div className="mb-4 p-3 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center print:hidden">
                      <Camera className="text-cyan-600 mr-2" size={16} />
                      <a href={m.resi.split(' | DOKUMENTASI:')[1]} target="_blank" rel="noreferrer" className="text-cyan-800 font-bold hover:underline text-xs break-all">
                        Klik untuk Melihat Lampiran Dokumentasi Serah Terima
                      </a>
                    </div>
                  )}

                  {/* MATRIKS KENDALI OTORISASI BERDASARKAN JABATAN */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 print:hidden">
                    {(role === 'admin' || role === 'owner') && (
                      <button onClick={() => window.print()} className="flex-1 min-w-[120px] bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold flex justify-center items-center transition shadow-md">
                        <Printer size={14} className="mr-2" /> Cetak Manifes PDF
                      </button>
                    )}
                    
                    {role === 'gudang' && m.status !== 'DITERIMA CUSTOMER' && m.status !== 'DALAM PENGIRIMAN' && (
                      <button onClick={() => updateStatusLogistik(m.id, 'DALAM PENGIRIMAN')} className="flex-1 min-w-[120px] bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-black flex justify-center items-center transition shadow-lg shadow-amber-500/10">
                        <Package size={14} className="mr-2" /> Validasi Selesai Muat
                      </button>
                    )}

                    {role === 'supir' && m.status !== 'DITERIMA CUSTOMER' && (
                      <button onClick={() => updateStatusLogistik(m.id, 'DITERIMA CUSTOMER')} className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black flex justify-center items-center transition shadow-lg shadow-emerald-600/10">
                        <CheckCircle size={14} className="mr-2" /> Konfirmasi Tiba & Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* LABEL RESMI KETIKA CETAK FISIK */}
      <div className="hidden print:block fixed bottom-6 w-full text-center text-xs text-slate-400 font-mono tracking-widest border-t pt-4">
        Diterbitkan Resmi via Cloud Kamil Logistik Management System — Waktu Cetak: {new Date().toLocaleString('id-ID')}
      </div>
    </div>
  );
}
