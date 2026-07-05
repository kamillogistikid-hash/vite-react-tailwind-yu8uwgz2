import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, ClipboardCheck, Camera, CheckCircle2, XCircle, User, 
  Plus, LogOut, MapPin, AlertCircle, Box, Scale, Settings, Users, 
  ShieldCheck, Edit2, Lock, ArrowLeft, Printer, AlertOctagon, Bell,
  Sparkles, Bot, Loader2, MessageSquareText, FileText, Banknote, Wallet,
  Crown, Key, Download, Image as ImageIcon
} from 'lucide-react';

// Konfigurasi Supabase REST API (Live Connection)
const supabaseUrl = 'https://eowtwkqcuggzogzbsayn.supabase.co/rest/v1';
const supabaseKey = 'sb_publishable_IJLF4yMmEVoA-2NasjcPBA_tEaJclm_';
const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// --- HELPER: FORMAT RUPIAH ---
const formatRp = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
};

// --- BRANDING COMPONENT ---
const BrandLogo = ({ isLarge = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-center ${isLarge ? 'mb-6' : ''} ${onClick ? 'cursor-pointer' : ''}`}>
    <img 
      src={`https://placehold.co/400x150/2596be/ffffff?text=LOGO+KAMIL+LOGISTIK`} 
      alt="Kamil Logistik" 
      className={`${isLarge ? 'h-24' : 'h-10'} object-contain rounded shadow-sm print:h-12`}
    />
  </div>
);

export default function App() {
  const [dbLoading, setDbLoading] = useState(true);
  const [role, setRole] = useState(null); 
  const [activeDriver, setActiveDriver] = useState(''); 
  const [loginStep, setLoginStep] = useState(0); 
  const [tempRole, setTempRole] = useState(null);
  const [loginPin, setLoginPin] = useState('');
  const [loginDriverId, setLoginDriverId] = useState('');

  // Data dari Supabase
  const [systemPins, setSystemPins] = useState({});
  const [manifests, setManifests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [armadas, setArmadas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // MENGAMBIL DATA DARI CLOUD SAAT APLIKASI DIBUKA
  const loadAllData = async () => {
    setDbLoading(true);
    try {
      let resPin = await fetch(`${supabaseUrl}/system_pins`, { headers });
      if (resPin.ok) {
        let dataPin = await resPin.json();
        const pinMap = {};
        if (dataPin && dataPin.length > 0) {
          dataPin.forEach(p => pinMap[p.role] = p.pin);
          setSystemPins(pinMap);
        } else {
          setSystemPins({ owner: 'Kamil2026', master: '9999', admin: '1111', gudang: '2222' });
        }
      }

      let resDrv = await fetch(`${supabaseUrl}/drivers`, { headers });
      if (resDrv.ok) {
        let dataDrv = await resDrv.json();
        if (dataDrv && dataDrv.length > 0) setDrivers(dataDrv);
      }

      let resArm = await fetch(`${supabaseUrl}/armadas`, { headers });
      if (resArm.ok) {
        let dataArm = await resArm.json();
        if (dataArm && dataArm.length > 0) setArmadas(dataArm);
      }

      let resMnf = await fetch(`${supabaseUrl}/manifests?select=*,items(*)&order=created_at.desc`, { headers });
      if (resMnf.ok) {
        let dataMnf = await resMnf.json();
        if (dataMnf && dataMnf.length > 0 && !dataMnf.error) {
          const formattedManifests = dataMnf.map(m => ({
            id: m.id, driver: m.driver, armada: m.armada, tujuan: m.tujuan, status: m.status,
            items: (m.items || []).map(it => ({
              id: it.id, penerima: it.penerima, alamat: it.alamat, kotaAsal: it.kota_asal, kotaTujuan: it.kota_tujuan,
              pembayaran: it.pembayaran, nominalCOD: it.nominal_cod, nominalDiterima: it.nominal_diterima,
              koli: it.koli, berat: it.berat, kubik: it.kubik, status: it.status,
              fotoResiUrl: it.foto_resi_url, fotoBarangUrl: it.foto_barang_url, fotoBayarUrl: it.foto_bayar_url, catatan: it.catatan
            }))
          }));
          setManifests(formattedManifests);
        } else {
          setManifests([]);
        }
      }
    } catch (err) {
      console.error("Gagal terhubung ke Cloud:", err);
      setSystemPins({ owner: 'Kamil2026', master: '9999', admin: '1111', gudang: '2222' });
      showToast("Koneksi gagal, silakan refresh halaman.", "error");
    }
    setDbLoading(false);
  };

  useEffect(() => { loadAllData(); }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleProceedToPin = (selectedRole) => {
    setTempRole(selectedRole); setLoginPin('');
    if (selectedRole === 'driver') {
      const active = drivers.filter(d => d.status === 'active');
      if (active.length > 0) setLoginDriverId(active[0].id);
    }
    setLoginStep(1);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (tempRole === 'driver') {
      const drv = drivers.find(d => d.id === loginDriverId);
      if (drv && drv.pin === loginPin && drv.status === 'active') {
        setActiveDriver(drv.name); setRole('driver'); setLoginStep(0);
        showToast(`Selamat bekerja, ${drv.name}!`);
      } else alert('Gagal! PIN salah atau akun dinonaktifkan.');
    } else {
      if (loginPin === systemPins[tempRole]) {
        setRole(tempRole); setLoginStep(0);
        showToast(`Berhasil login sebagai ${tempRole}`);
      } else alert(tempRole === 'owner' ? 'Gagal! Kata Sandi salah.' : 'Gagal! Kode Akses (PIN) salah.');
    }
  };

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 flex-col text-center">
        <Loader2 size={48} className="text-[#2596be] animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Menyinkronkan Cloud...</h2>
        <p className="text-slate-500 font-medium">Kamil Logistik Server</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-[#2596be]">
          <BrandLogo isLarge={true} onClick={() => handleProceedToPin('owner')} />

          {loginStep === 0 ? (
            <div className="space-y-3">
              <button onClick={() => handleProceedToPin('master')} className="w-full bg-slate-900 hover:bg-black text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition"><ShieldCheck size={20} /> Master / Manager</button>
              <div className="border-t my-4 border-gray-200"></div>
              <button onClick={() => handleProceedToPin('admin')} className="w-full bg-[#2596be] hover:bg-[#1e7a9c] text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"><User size={20} /> Admin Dispatch</button>
              <button onClick={() => handleProceedToPin('gudang')} className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"><ClipboardCheck size={20} /> Staff Gudang</button>
              <button onClick={() => handleProceedToPin('driver')} className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"><Truck size={20} /> Driver Armada</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <button type="button" onClick={() => setLoginStep(0)} className="text-gray-500 font-semibold mb-4 flex items-center gap-1 hover:text-[#2596be] transition"><ArrowLeft size={16}/> Kembali</button>
              <h2 className="text-lg font-bold text-center capitalize mb-4 text-slate-800">
                {tempRole === 'owner' ? 'Otorisasi Keamanan' : `Login ${tempRole}`}
              </h2>
              {tempRole === 'driver' && (
                <select className="w-full border-2 border-slate-200 p-3 rounded-lg bg-gray-50 mb-4 focus:outline-none" value={loginDriverId} onChange={(e) => setLoginDriverId(e.target.value)} required>
                  {drivers.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type={tempRole === 'owner' ? "text" : "password"} 
                  pattern={tempRole === 'owner' ? undefined : "[0-9]*"} 
                  inputMode={tempRole === 'owner' ? undefined : "numeric"}
                  placeholder={tempRole === 'owner' ? "Masukkan Kata Sandi" : "PIN Akses (Angka)"}
                  className={`w-full border-2 border-slate-200 p-3 pl-10 rounded-lg text-lg font-bold focus:border-[#2596be] outline-none ${tempRole === 'owner' ? '' : 'tracking-widest'}`} 
                  value={loginPin} onChange={(e) => setLoginPin(e.target.value)} required 
                />
              </div>
              <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg mt-4 transition shadow-lg ${tempRole === 'owner' ? 'bg-yellow-600' : 'bg-[#2596be]'}`}>Masuk Aplikasi</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans print:bg-white print:pb-0">
      <header className={`bg-white shadow-sm sticky top-0 z-40 print:hidden border-b ${role === 'owner' ? 'border-yellow-500' : 'border-gray-200'}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-full border hidden sm:flex items-center gap-1 ${role === 'owner' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {role === 'owner' && <Crown size={14}/>}
              {role === 'driver' ? `Supir: ${activeDriver}` : `Panel: ${role}`}
            </span>
            <button onClick={() => setRole(null)} className="text-red-500 hover:bg-red-50 p-2 rounded-full flex items-center gap-1 text-sm font-bold transition"><LogOut size={16} /> Keluar</button>
          </div>
        </div>
      </header>

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 print:hidden animate-fade-in-down ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />} {toast.message}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 print:p-0 print:m-0">
        {role === 'owner' && <OwnerView systemPins={systemPins} showToast={showToast} refreshData={loadAllData} />}
        {role === 'master' && <MasterView drivers={drivers} armadas={armadas} showToast={showToast} refreshData={loadAllData} />}
        {role === 'admin' && <AdminView manifests={manifests} drivers={drivers} armadas={armadas} notifications={notifications} setNotifications={setNotifications} showToast={showToast} refreshData={loadAllData} />}
        {role === 'gudang' && <GudangView manifests={manifests} addNotification={(msg) => setNotifications([msg, ...notifications])} showToast={showToast} refreshData={loadAllData} />}
        {role === 'driver' && <DriverView manifests={manifests} activeDriver={activeDriver} showToast={showToast} refreshData={loadAllData} />}
      </main>
    </div>
  );
}

// ==========================================
// 0. OWNER VIEW
// ==========================================
function OwnerView({ systemPins, showToast, refreshData }) {
  // (Fungsi OwnerView tetap sama seperti sebelumnya karena tidak ada isu di sini)
  const [editingRole, setEditingRole] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePin = async (roleKey) => {
    if (newPin.length < 4) return alert("Sandi minimal 4 karakter!");
    setIsSaving(true);
    try {
      await fetch(`${supabaseUrl}/system_pins?role=eq.${roleKey}`, { method: 'PATCH', headers, body: JSON.stringify({ pin: newPin }) });
      showToast(`Akses untuk ${roleKey} diperbarui!`);
      refreshData(); setEditingRole(null);
    } catch(err) { alert("Gagal."); }
    setIsSaving(false);
  };

  const roles = [
    { key: 'master', label: 'Master / Manager', type: 'PIN Angka', icon: <ShieldCheck className="text-slate-700"/>, color: 'bg-slate-100 border-slate-300' },
    { key: 'admin', label: 'Admin Dispatch', type: 'PIN Angka', icon: <User className="text-[#2596be]"/>, color: 'bg-blue-50 border-blue-200' },
    { key: 'gudang', label: 'Staff Gudang', type: 'PIN Angka', icon: <ClipboardCheck className="text-orange-500"/>, color: 'bg-orange-50 border-orange-200' },
    { key: 'owner', label: 'Pemilik Sistem (Anda)', type: 'Sandi', icon: <Crown className="text-yellow-600"/>, color: 'bg-yellow-50 border-yellow-300' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-yellow-700 to-yellow-500 text-white p-8 rounded-2xl shadow-xl border-b-8 border-yellow-900">
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3"><Crown size={32}/> BRANKAS PEMILIK SISTEM</h2>
        <p className="text-yellow-100 font-medium">Perubahan sandi akan langsung berlaku ke seluruh sistem.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <div className="space-y-4">
          {roles.map((r) => (
            <div key={r.key} className={`p-4 rounded-xl border flex justify-between items-center ${r.color}`}>
              <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg">{r.icon}</div>
                <div><p className="font-bold text-lg">{r.label}</p><p className="text-xs font-bold text-slate-500">{editingRole !== r.key && `Sandi: ${systemPins[r.key]}`}</p></div>
              </div>
              {editingRole === r.key ? (
                <div className="flex gap-2">
                  <input type={r.key === 'owner' ? "text" : "password"} className="border-2 border-yellow-500 p-2 rounded-lg w-32 font-bold text-center" value={newPin} onChange={e => setNewPin(e.target.value)} autoFocus />
                  <button onClick={() => handleSavePin(r.key)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                  <button onClick={() => setEditingRole(null)} className="bg-slate-300 text-slate-800 font-bold py-2 px-3 rounded-lg">Batal</button>
                </div>
              ) : ( <button onClick={() => {setEditingRole(r.key); setNewPin(systemPins[r.key]);}} className="bg-white border text-slate-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Edit2 size={16}/> Ubah</button> )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 1. MASTER VIEW
// ==========================================
function MasterView({ drivers, armadas, showToast, refreshData }) {
  // MasterView tidak diubah, hanya fitur basic yang sudah stabil
  const [showFormDriver, setShowFormDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', pin: '' });
  
  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.pin) return;
    const id = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
    await fetch(`${supabaseUrl}/drivers`, { method: 'POST', headers, body: JSON.stringify({ id, name: newDriver.name, phone: newDriver.phone, pin: newDriver.pin, status: 'active' }) });
    setNewDriver({ name: '', phone: '', pin: '' }); setShowFormDriver(false); refreshData(); showToast("Supir ditambahkan");
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border-t-4 border-[#2596be]">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><ShieldCheck/> Master Control Panel</h2>
      </div>
      <div className="bg-white p-5 rounded-xl shadow border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Users className="text-[#2596be]"/> Data Supir</h3>
          <button onClick={() => setShowFormDriver(!showFormDriver)} className="text-[#2596be] bg-[#e0f2fe] px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#bae6fd] transition">{showFormDriver ? 'Batal' : '+ Tambah'}</button>
        </div>
        {showFormDriver && (
          <div className="mb-4 p-4 bg-slate-50 border rounded-lg space-y-3">
            <input type="text" placeholder="Nama Lengkap Supir" className="w-full border p-2 rounded" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
            <input type="text" placeholder="No HP" className="w-full border p-2 rounded" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
            <input type="number" placeholder="PIN (Angka)" className="w-full border p-2 rounded" value={newDriver.pin} onChange={e => setNewDriver({...newDriver, pin: e.target.value})} />
            <button onClick={handleAddDriver} className="w-full bg-[#2596be] text-white font-bold py-2 rounded">Simpan ke Cloud</button>
          </div>
        )}
        <div className="space-y-3">
          {drivers.map(drv => (
            <div key={drv.id} className="flex justify-between p-3 rounded-lg border bg-white"><p className="font-bold">{drv.name}</p><p className="text-xs text-slate-500">PIN: {drv.pin}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. ADMIN VIEW (Diperbarui Kolom Berat & Backup Data & View Foto)
// ==========================================
function AdminView({ manifests, drivers, armadas, notifications, setNotifications, showToast, refreshData }) {
  const [showForm, setShowForm] = useState(false);
  const [newManifest, setNewManifest] = useState({ driver: '', armada: '', tujuan: '', items: [] });
  // Perbaikan kolom berat
  const [newItem, setNewItem] = useState({ id: '', penerima: '', alamat: '', kotaAsal: 'Makassar', kotaTujuan: '', pembayaran: 'Lunas', nominalCOD: '', koli: '', berat: '', kubik: '' });
  const [isPublishing, setIsPublishing] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null); // State untuk menampilkan foto besar

  const addItemToManifest = () => {
    if(!newItem.id || !newItem.penerima) return alert("Resi dan Penerima wajib diisi!");
    setNewManifest({ 
      ...newManifest, 
      items: [...newManifest.items, { 
        ...newItem, 
        nominalCOD: Number(newItem.nominalCOD) || 0, nominalDiterima: 0,
        status: 'pending', fotoResiUrl: null, fotoBarangUrl: null, fotoBayarUrl: null, catatan: '', 
        koli: Number(newItem.koli) || 1, 
        berat: Number(newItem.berat) || 0, // Dikonversi ke Number saat disimpan ke tabel
        kubik: Number(newItem.kubik) || 0 
      }] 
    });
    setNewItem({ ...newItem, id: '', penerima: '', alamat: '', kotaTujuan: '', nominalCOD: '', koli: '', berat: '', kubik: '' });
  };

  const handleCreateManifest = async () => {
    if(newManifest.items.length === 0) return alert("Minimal 1 resi!");
    setIsPublishing(true);
    try {
      const manifestId = `MNF-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000)}`;
      await fetch(`${supabaseUrl}/manifests`, { method: 'POST', headers, body: JSON.stringify({ id: manifestId, driver: newManifest.driver, armada: newManifest.armada, tujuan: newManifest.tujuan, status: 'loading' }) });
      const dbItems = newManifest.items.map(it => ({
        id: it.id, manifest_id: manifestId, penerima: it.penerima, alamat: it.alamat,
        kota_asal: it.kotaAsal, kota_tujuan: it.kotaTujuan, pembayaran: it.pembayaran,
        nominal_cod: it.nominalCOD, nominal_diterima: 0, koli: it.koli, berat: it.berat, kubik: it.kubik, status: 'pending'
      }));
      await fetch(`${supabaseUrl}/items`, { method: 'POST', headers, body: JSON.stringify(dbItems) });
      showToast("Manifest diterbitkan & disinkron ke Cloud!");
      setShowForm(false); setNewManifest({ driver: '', armada: '', tujuan: '', items: [] });
      await refreshData();
    } catch(err) { alert(`EROR CLOUD:\n${err.message}`); }
    setIsPublishing(false);
  };

  // FUNGSI BACKUP DATA KE CSV
  const handleBackup = () => {
    let csv = "ID Manifest,Tanggal,Tujuan,Driver,Armada,Status Truk,ID Resi,Penerima,Alamat,Muatan (Koli/Kg),Status Resi,Pembayaran,Tagihan COD\n";
    manifests.forEach(m => {
      m.items.forEach(it => {
        csv += `"${m.id}","${new Date().toLocaleDateString('id-ID')}","${m.tujuan}","${m.driver}","${m.armada}","${m.status}","${it.id}","${it.penerima}","${it.alamat}","${it.koli} Koli / ${it.berat} Kg","${it.status}","${it.pembayaran}","${it.nominalCOD}"\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Backup_Kamil_Logistik_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Berhasil mencetak Backup Data ke CSV (Excel)!");
  };

  return (
    <div className="space-y-6 print:space-y-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold text-slate-800">Daftar Manifest Cloud</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleBackup} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition font-bold text-sm">
            <Download size={18} /> Backup Data (Excel)
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex-1 md:flex-none bg-[#2596be] hover:bg-[#1e7a9c] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition font-bold text-sm">
            {showForm ? 'Batal' : <><Plus size={18} /> Buat Manifest</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input className="border-2 border-slate-200 p-2.5 rounded-lg" placeholder="Nama Supir" value={newManifest.driver} onChange={e => setNewManifest({...newManifest, driver: e.target.value})} />
            <input className="border-2 border-slate-200 p-2.5 rounded-lg" placeholder="Armada / Plat" value={newManifest.armada} onChange={e => setNewManifest({...newManifest, armada: e.target.value})} />
            <input className="border-2 border-slate-200 p-2.5 rounded-lg" placeholder="Tujuan Truk" value={newManifest.tujuan} onChange={e => setNewManifest({...newManifest, tujuan: e.target.value})} />
          </div>
          
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              <input className="border p-2.5 rounded-lg text-sm border-slate-300" placeholder="No Resi" value={newItem.id} onChange={e => setNewItem({...newItem, id: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm bg-white border-slate-300" placeholder="Nama Penerima" value={newItem.penerima} onChange={e => setNewItem({...newItem, penerima: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm border-slate-300" placeholder="Kota Asal" value={newItem.kotaAsal} onChange={e => setNewItem({...newItem, kotaAsal: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm border-slate-300" placeholder="Kota Tujuan" value={newItem.kotaTujuan} onChange={e => setNewItem({...newItem, kotaTujuan: e.target.value})} />
              <select className="border p-2.5 rounded-lg text-sm font-semibold border-slate-300" value={newItem.pembayaran} onChange={e => setNewItem({...newItem, pembayaran: e.target.value, nominalCOD: ''})}>
                <option value="Lunas">💳 Lunas</option><option value="Invoice">📄 Invoice (B2B)</option><option value="COD (Belum Lunas)">💰 COD (Full)</option>
              </select>
            </div>
            
            {/* INI PERBAIKAN KOLOM BERAT YANG BISA DIKETIK */}
            <div className="flex gap-3">
              <input className="border p-2.5 rounded-lg text-sm w-20 border-slate-300" placeholder="Koli" type="number" value={newItem.koli} onChange={e => setNewItem({...newItem, koli: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm w-24 border-slate-300 bg-white shadow-inner focus:border-[#2596be]" placeholder="Berat (Kg)" type="number" value={newItem.berat} onChange={e => setNewItem({...newItem, berat: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm flex-1 border-slate-300" placeholder="Alamat Lengkap" value={newItem.alamat} onChange={e => setNewItem({...newItem, alamat: e.target.value})} />
              <button onClick={addItemToManifest} className="bg-slate-900 text-white font-bold rounded-lg p-2 px-6">Tambah Resi</button>
            </div>
          </div>
          <button onClick={handleCreateManifest} disabled={isPublishing} className="w-full bg-[#2596be] text-white font-bold py-3.5 rounded-xl">{isPublishing ? 'Menerbitkan...' : 'Terbitkan Manifest & Sinkron Cloud'}</button>
        </div>
      )}

      {/* MANIFEST LIST & PHOTO VIEWER */}
      <div className="grid gap-6 print:block print:space-y-12">
        {manifests.map(mnf => (
          <div key={mnf.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-8 border-t-[#2596be]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="font-black text-2xl uppercase tracking-widest text-slate-900">{mnf.id}</h3>
                <p className="text-slate-500 mt-1 font-medium">Driver: {mnf.driver} | Plat: {mnf.armada}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <StatusBadge status={mnf.status} />
                <button onClick={() => window.print()} className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={16}/> Cetak</button>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b">
                    <th className="p-3 font-semibold">No. Resi</th>
                    <th className="p-3 font-semibold">Penerima & Alamat</th>
                    <th className="p-3 text-center font-semibold">Muatan</th>
                    <th className="p-3 text-center font-semibold">Status & Bukti Foto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mnf.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50 transition">
                      <td className="p-3"><div className="font-bold text-slate-900">{it.id}</div></td>
                      <td className="p-3"><strong>{it.penerima}</strong><div className="text-xs text-slate-500">{it.alamat}</div></td>
                      {/* BUKTI KOLOM BERAT TERISI */}
                      <td className="p-3 text-center"><div className="font-bold">{it.koli} Koli</div><div className="text-xs text-[#2596be] font-bold">{it.berat} Kg</div></td>
                      <td className="p-3">
                         <div className="flex flex-col items-center gap-1.5">
                           <ItemStatusBadge status={it.status} />
                           {/* BUKTI FOTO DARI DRIVER TAMPIL DI SINI */}
                           {(it.fotoResiUrl || it.fotoBarangUrl) && (
                             <div className="flex gap-1 mt-1">
                               {it.fotoResiUrl && <button onClick={() => setViewPhoto(it.fotoResiUrl)} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold flex items-center gap-1 hover:bg-blue-200"><ImageIcon size={12}/> Resi</button>}
                               {it.fotoBarangUrl && <button onClick={() => setViewPhoto(it.fotoBarangUrl)} className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold flex items-center gap-1 hover:bg-indigo-200"><ImageIcon size={12}/> Barang</button>}
                             </div>
                           )}
                           {it.catatan && <p className="text-[10px] text-slate-500 italic mt-1 bg-white border px-1 w-full text-center truncate max-w-[120px]" title={it.catatan}>"{it.catatan}"</p>}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP UNTUK MELIHAT FOTO BUKTI */}
      {viewPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4" onClick={() => setViewPhoto(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewPhoto(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition">Tutup Foto (X)</button>
            <img src={viewPhoto} className="w-full h-auto rounded-xl shadow-2xl border-4 border-white" alt="Bukti Pengiriman Ber-Watermark" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. GUDANG VIEW 
// ==========================================
function GudangView({ manifests, addNotification, showToast, refreshData }) {
  const loadingManifests = manifests.filter(m => m.status === 'loading');
  const dispatchManifest = async (manifestId) => {
    await fetch(`${supabaseUrl}/manifests?id=eq.${manifestId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'on_delivery' }) });
    showToast("Truk diberangkatkan!"); refreshData();
  };
  const handleChecklist = async (manifestId, itemId, action) => {
    await fetch(`${supabaseUrl}/items?id=eq.${itemId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: action === 'load' ? 'loaded' : 'issue' }) });
    refreshData();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 border-b-2 border-[#2596be] pb-2 flex items-center gap-2"><ClipboardCheck className="text-[#2596be]"/> Tugas Muat Gudang (Live)</h2>
      {loadingManifests.length === 0 && (
        <div className="bg-white p-10 text-center rounded-xl shadow-sm border border-slate-200">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-green-400" />
          <p className="text-slate-500 font-medium text-lg">Semua truk sudah berangkat. Gudang bersih!</p>
        </div>
      )}
      {loadingManifests.map(mnf => {
        const isReadyToDispatch = mnf.items.length > 0 && mnf.items.every(i => i.status === 'loaded' || i.status === 'issue');
        return (
          <div key={mnf.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 mb-6">
            <div className="bg-orange-500 text-white p-5"><h3 className="font-bold text-xl">{mnf.id}</h3></div>
            <div className="p-5 space-y-3">
              {mnf.items.map(it => (
                <div key={it.id} className={`p-4 rounded-xl border ${it.status === 'loaded' ? 'bg-green-50 border-green-300' : 'bg-slate-50'}`}>
                  <div className="flex justify-between mb-2"><div><p className="font-bold">{it.id}</p><p className="text-xs">{it.penerima}</p></div>
                  <div>{it.status === 'loaded' && <CheckCircle2 className="text-green-500 w-8 h-8"/>}</div></div>
                  {it.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t"><button onClick={() => handleChecklist(mnf.id, it.id, 'load')} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-1"><CheckCircle2 size={16}/> Masuk Truk</button></div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-50 border-t"><button onClick={() => dispatchManifest(mnf.id)} disabled={!isReadyToDispatch} className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 ${isReadyToDispatch ? 'bg-orange-500 text-white' : 'bg-slate-300 text-slate-500'}`}><Truck size={20} /> Berangkatkan Truk</button></div>
          </div>
        )
      })}
    </div>
  );
}

// ==========================================
// 4. DRIVER VIEW (Diperbarui Watermark & Auto Hilang Tugas & Auto Selesai Manifest)
// ==========================================
function DriverView({ manifests, activeDriver, showToast, refreshData }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [catatanText, setCatatanText] = useState('');
  const [inputUangDiterima, setInputUangDiterima] = useState('');
  
  // State untuk menyimpan Base64 foto
  const [fotoResi, setFotoResi] = useState(null);
  const [fotoBarang, setFotoBarang] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Filter manifest: Hanya tampil jika ADA resi yang BUKAN status delivered/returned
  const myManifests = manifests
    .filter(m => m.driver === activeDriver && (m.status === 'on_delivery' || m.status === 'loading'))
    .map(mnf => ({ ...mnf, items: mnf.items.filter(it => it.status !== 'issue' && it.status !== 'delivered' && it.status !== 'returned') }))
    .filter(mnf => mnf.items.length > 0);

  // FUNGSI MEMROSES KAMERA & MENAMBAH WATERMARK LOKASI/WAKTU
  const processImageWatermark = (e, setPhotoState) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Kompres ukuran agar tidak memberatkan Cloud
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        
        // 1. Gambar foto asli
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 2. Buat background hitam transparan di bawah untuk teks
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
        
        // 3. Tambahkan Teks Waktu
        ctx.fillStyle = "white";
        ctx.font = "bold 16px sans-serif";
        const timeStr = new Date().toLocaleString('id-ID');
        
        const drawText = (locationText) => {
          ctx.fillText(`Waktu: ${timeStr}`, 15, canvas.height - 35);
          ctx.font = "14px sans-serif";
          ctx.fillText(`Lokasi: ${locationText}`, 15, canvas.height - 15);
          // Ubah ke format Base64 JPEG untuk disimpan
          setPhotoState(canvas.toDataURL('image/jpeg', 0.6));
          setIsUploading(false);
        };

        // Dapatkan Lokasi GPS Supir (Browser akan meminta izin lokasi)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => drawText(`Lat ${pos.coords.latitude.toFixed(4)}, Long ${pos.coords.longitude.toFixed(4)}`),
            () => drawText("Akses GPS ditolak/gagal"),
            { timeout: 5000 }
          );
        } else {
          drawText("GPS tidak didukung perangkat");
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const updateItemStatus = async (manifestId, itemId, newStatus) => {
    const isCOD = selectedItem.item.pembayaran.includes('COD');
    if (newStatus === 'delivered' && isCOD && !inputUangDiterima) return alert("Harap masukkan nominal uang yang diterima!");

    const updatePayload = {
      status: newStatus,
      foto_resi_url: fotoResi, 
      foto_barang_url: fotoBarang, 
      foto_bayar_url: null,
      nominal_diterima: isCOD ? Number(inputUangDiterima) : 0, 
      catatan: catatanText || (newStatus === 'delivered' ? 'Diterima dengan baik' : 'Retur/Gagal kirim') 
    };

    try {
      showToast("Sedang mengunggah ke Cloud...", "success");
      // 1. Update Resi (Item)
      await fetch(`${supabaseUrl}/items?id=eq.${itemId}`, { method: 'PATCH', headers, body: JSON.stringify(updatePayload) });
      
      // 2. CEK APAKAH INI RESI TERAKHIR DI MANIFEST INI? (Sync ke Admin)
      const originalMnf = manifests.find(m => m.id === manifestId);
      const otherItems = originalMnf.items.filter(it => it.id !== itemId);
      const isLastItem = otherItems.every(it => ['delivered', 'returned', 'issue'].includes(it.status));
      
      // Jika semua resi selain yang ini sudah selesai, ubah status Truk jadi 'completed'
      if (isLastItem) {
        await fetch(`${supabaseUrl}/manifests?id=eq.${manifestId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'completed' }) });
      }

      setSelectedItem(null); setCatatanText(''); setInputUangDiterima(''); setFotoResi(null); setFotoBarang(null);
      refreshData();
      showToast("Laporan Berhasil Masuk ke Admin!");
    } catch (err) {
      alert("Gagal koneksi ke Cloud.");
    }
  };

  return (
    <div className="max-w-md mx-auto relative pb-10">
      <div className="mb-6 bg-slate-900 text-white p-5 rounded-2xl shadow-lg border-t-4 border-[#2596be]">
        <h2 className="text-xl font-bold">Tugas Pengiriman</h2>
        <p className="text-slate-300 text-sm mt-1">Hati-hati di jalan, <strong>{activeDriver}</strong>!</p>
      </div>

      {myManifests.length === 0 && (
         <div className="bg-white p-10 text-center rounded-xl shadow-sm border border-slate-200">
           <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-green-400" />
           <p className="text-slate-500 font-medium text-lg">Semua tugas Anda telah selesai! Data sudah hilang dari sini dan terlaporkan ke Admin.</p>
         </div>
      )}

      {myManifests.map(mnf => (
        <div key={mnf.id} className="space-y-4 mb-8">
          <div className="bg-[#2596be] text-white p-4 rounded-xl shadow-md border-b-4 border-[#1e7a9c] flex justify-between items-center"><h3 className="font-bold tracking-wider">Muatan: {mnf.id}</h3><span className="bg-[#1e7a9c] text-xs px-2 py-1 rounded font-bold">Sisa {mnf.items.length} Resi</span></div>
          {mnf.items.map(it => (
            <div key={it.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-[#2596be]">
              <div className="flex justify-between items-start mb-3"><span className="font-black text-lg text-slate-800">{it.id}</span><ItemStatusBadge status={it.status} /></div>
              <div className="text-sm text-slate-600 mb-4 space-y-1.5"><p className="flex items-start gap-2"><User size={16} className="mt-0.5 text-slate-400"/> <span className="font-semibold text-slate-800">{it.penerima}</span></p><p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-slate-400"/> {it.alamat}</p><p className="flex items-start gap-2 font-bold text-[#2596be] mt-2"><Package size={16} className="mt-0.5"/> {it.koli} Koli | {it.berat} Kg</p></div>
              <button onClick={() => setSelectedItem({ manifestId: mnf.id, item: it })} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-black transition"><Camera size={18} /> Ambil Bukti & Update Selesai</button>
            </div>
          ))}
        </div>
      ))}

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl my-auto border-t-8 border-[#2596be]">
            <h3 className="font-black text-xl mb-4 text-slate-800 border-b pb-3">Laporan: {selectedItem.item.id}</h3>
            
            {/* FITUR KAMERA DENGAN WATERMARK */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Foto Fisik Resi & Barang (Wajib GPS)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-1 text-center cursor-pointer hover:bg-slate-50 h-32 flex flex-col items-center justify-center relative bg-slate-50 overflow-hidden">
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => processImageWatermark(e, setFotoResi)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {fotoResi ? <img src={fotoResi} className="w-full h-full object-cover rounded-lg" alt="Preview" /> : <><Camera className="text-slate-400 w-8 h-8 mb-2" /><p className="text-xs text-slate-600 font-bold">Jepret Resi</p></>}
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-1 text-center cursor-pointer hover:bg-slate-50 h-32 flex flex-col items-center justify-center relative bg-slate-50 overflow-hidden">
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => processImageWatermark(e, setFotoBarang)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {fotoBarang ? <img src={fotoBarang} className="w-full h-full object-cover rounded-lg" alt="Preview" /> : <><Camera className="text-slate-400 w-8 h-8 mb-2" /><p className="text-xs text-slate-600 font-bold">Jepret Barang</p></>}
                </div>
              </div>
              {isUploading && <p className="text-xs text-[#2596be] font-bold mt-2 animate-pulse text-center">Memproses Watermark GPS & Waktu...</p>}
            </div>

            <div className="mb-6"><label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Catatan Tambahan</label><textarea className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:border-[#2596be] outline-none min-h-[80px]" placeholder="Ada pesan khusus? Ketik di sini..." value={catatanText} onChange={(e) => setCatatanText(e.target.value)} /></div>
            
            <div className="grid grid-cols-2 gap-3"><button onClick={() => updateItemStatus(selectedItem.manifestId, selectedItem.item.id, 'returned')} className="bg-red-50 text-red-700 hover:bg-red-100 font-bold py-3.5 rounded-xl border border-red-200 flex justify-center items-center gap-2 transition"><XCircle size={18}/> Retur</button><button onClick={() => updateItemStatus(selectedItem.manifestId, selectedItem.item.id, 'delivered')} className="bg-green-600 text-white hover:bg-green-700 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg transition"><CheckCircle2 size={18}/> Diterima</button></div>
            <button onClick={() => {setSelectedItem(null); setCatatanText(''); setInputUangDiterima(''); setFotoResi(null); setFotoBarang(null);}} className="w-full mt-4 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl font-bold py-3 transition">Batal / Kembali</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// UTILS COMPONENTS
// ==========================================
function StatusBadge({ status }) {
  const styles = { loading: 'bg-yellow-100 text-yellow-800 border-yellow-200', on_delivery: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]', completed: 'bg-green-100 text-green-800 border-green-200' };
  const labels = { loading: 'Proses Muat', on_delivery: 'Dalam Perjalanan', completed: 'Selesai' };
  return <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md border uppercase tracking-wider print:border-black print:bg-transparent print:text-black ${styles[status]}`}>{labels[status]}</span>;
}
function ItemStatusBadge({ status }) {
  const styles = { pending: 'bg-slate-100 text-slate-600', loaded: 'bg-yellow-100 text-yellow-700', delivered: 'bg-green-100 text-green-800', returned: 'bg-red-100 text-red-800', issue: 'bg-red-600 text-white' };
  const labels = { pending: 'Di Gudang', loaded: 'Di Truk', delivered: 'Terkirim', returned: 'Retur', issue: 'Barang Kurang' };
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider print:border print:border-black print:bg-transparent print:text-black ${styles[status]}`}>{labels[status]}</span>;
}
