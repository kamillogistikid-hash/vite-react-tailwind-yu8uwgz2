import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, ClipboardCheck, Camera, CheckCircle2, XCircle, User, 
  Plus, LogOut, MapPin, AlertCircle, Box, Scale, Settings, Users, 
  ShieldCheck, Edit2, Lock, ArrowLeft, Printer, AlertOctagon, Bell,
  Sparkles, Bot, Loader2, MessageSquareText, FileText, Banknote, Wallet,
  Crown, Key, Download, Image as ImageIcon, Trash2, Search, FileSignature
} from 'lucide-react';

// Konfigurasi Supabase REST API
const supabaseUrl = 'https://eowtwkqcuggzogzbsayn.supabase.co/rest/v1';
const supabaseKey = 'sb_publishable_IJLF4yMmEVoA-2NasjcPBA_tEaJclm_';
const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const LOGO_PERUSAHAAN_URL = "https://placehold.co/150x150/2596be/ffffff?text=KAMIL+LOGISTIK";

const formatRp = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
};

const BrandLogo = ({ isLarge = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-center ${isLarge ? 'mb-6' : ''} ${onClick ? 'cursor-pointer' : ''}`}>
    <img 
      src={LOGO_PERUSAHAAN_URL} 
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

  const [systemPins, setSystemPins] = useState({});
  const [manifests, setManifests] = useState([]);
  const [availableItems, setAvailableItems] = useState([]); 
  const [drivers, setDrivers] = useState([]);
  const [armadas, setArmadas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const loadAllData = async () => {
    setDbLoading(true);
    try {
      let resPin = await fetch(`${supabaseUrl}/system_pins`, { headers });
      let dataPin = resPin.ok ? await resPin.json() : [];
      const pinMap = {};
      if (dataPin && dataPin.length > 0) {
        dataPin.forEach(p => pinMap[p.role] = p.pin);
        setSystemPins(pinMap);
      } else {
        setSystemPins({ owner: 'Kamil2026', master: '9999', admin: '1111', gudang: '2222', admin_resi: '5555' });
      }

      let resDrv = await fetch(`${supabaseUrl}/drivers`, { headers });
      if (resDrv.ok) setDrivers(await resDrv.json());

      let resArm = await fetch(`${supabaseUrl}/armadas`, { headers });
      if (resArm.ok) setArmadas(await resArm.json());

      let resUnassigned = await fetch(`${supabaseUrl}/items?manifest_id=is.null&order=created_at.desc`, { headers });
      if (resUnassigned.ok) setAvailableItems(await resUnassigned.json());

      let resMnf = await fetch(`${supabaseUrl}/manifests?select=*,items(*)&order=created_at.desc`, { headers });
      if (resMnf.ok) {
        let dataMnf = await resMnf.json();
        if (dataMnf && !dataMnf.error) {
          const formattedManifests = dataMnf.map(m => ({
            id: m.id, driver: m.driver, armada: m.armada, tujuan: m.tujuan, status: m.status,
            items: (m.items || []).map(it => ({
              id: it.id, resi_manual: it.resi_manual || it.id,
              penerima: it.penerima, alamat: it.alamat, kotaAsal: it.kota_asal, kotaTujuan: it.kota_tujuan,
              pembayaran: it.pembayaran, nominalCOD: it.nominal_cod, nominalDiterima: it.nominal_diterima,
              koli: it.koli, berat: it.berat, kubik: it.kubik, status: it.status,
              fotoResiUrl: it.foto_resi_url, fotoBarangUrl: it.foto_barang_url, fotoBayarUrl: it.foto_bayar_url, catatan: it.catatan,
              pengirim: it.pengirim
            }))
          }));
          setManifests(formattedManifests);
        }
      }
    } catch (err) {
      console.error("Gagal terhubung ke Cloud Database:", err);
      setSystemPins({ owner: 'Kamil2026', master: '9999', admin: '1111', gudang: '2222', admin_resi: '5555' });
      showToast("Gagal mengambil data Cloud.", "error");
    }
    setDbLoading(false);
  };

  useEffect(() => { loadAllData(); }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
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
      if (loginPin === (systemPins[tempRole] || '5555')) {
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
              <button onClick={() => handleProceedToPin('admin_resi')} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"><FileSignature size={20} /> Admin Resi</button>
              <button onClick={() => handleProceedToPin('admin')} className="w-full bg-[#2596be] hover:bg-[#1e7a9c] text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"><User size={20} /> Admin Dispatch</button>
              <button onClick={() => handleProceedToPin('gudang')} className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"><ClipboardCheck size={20} /> Staff Gudang</button>
              <button onClick={() => handleProceedToPin('driver')} className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md"><Truck size={20} /> Driver Armada</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <button type="button" onClick={() => setLoginStep(0)} className="text-gray-500 font-semibold mb-4 flex items-center gap-1 hover:text-[#2596be] transition"><ArrowLeft size={16}/> Kembali</button>
              <h2 className="text-lg font-bold text-center capitalize mb-4 text-slate-800">
                {tempRole === 'owner' ? 'Otorisasi Keamanan' : `Login ${tempRole.replace('_', ' ')}`}
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
              <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg mt-4 transition shadow-lg ${tempRole === 'owner' ? 'bg-yellow-600' : tempRole === 'admin_resi' ? 'bg-purple-600' : 'bg-[#2596be]'}`}>Masuk Aplikasi</button>
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
              {role === 'driver' ? `Supir: ${activeDriver}` : `Panel: ${role.replace('_', ' ')}`}
            </span>
            <button onClick={() => setRole(null)} className="text-red-500 hover:bg-red-50 p-2 rounded-full flex items-center gap-1 text-sm font-bold transition"><LogOut size={16} /> Keluar</button>
          </div>
        </div>
      </header>

      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 print:hidden animate-fade-in-down ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <CheckCircle2 size={18} /> {toast.message}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 print:p-0 print:m-0">
        {role === 'owner' && <OwnerView systemPins={systemPins} showToast={showToast} refreshData={loadAllData} />}
        {role === 'master' && <MasterView drivers={drivers} armadas={armadas} showToast={showToast} refreshData={loadAllData} />}
        {role === 'admin_resi' && <AdminResiView manifests={manifests} availableItems={availableItems} showToast={showToast} refreshData={loadAllData} notifications={notifications} setNotifications={setNotifications} />}
        {role === 'admin' && <AdminDispatchView manifests={manifests} availableItems={availableItems} drivers={drivers} armadas={armadas} showToast={showToast} refreshData={loadAllData} />}
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
  const [editingRole, setEditingRole] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (roleKey) => { setEditingRole(roleKey); setNewPin(systemPins[roleKey] || '5555'); };

  const handleSavePin = async (roleKey) => {
    if (newPin.length < 4) return alert("Sandi minimal 4 karakter!");
    setIsSaving(true);
    try {
      await fetch(`${supabaseUrl}/system_pins?role=eq.${roleKey}`, { method: 'PATCH', headers, body: JSON.stringify({ pin: newPin }) });
      await fetch(`${supabaseUrl}/system_pins`, { method: 'POST', headers, body: JSON.stringify({ role: roleKey, pin: newPin }) });
      showToast(`Akses untuk ${roleKey.replace('_', ' ').toUpperCase()} diperbarui!`);
      refreshData(); setEditingRole(null);
    } catch(err) { alert("Gagal menyimpan ke Cloud"); }
    setIsSaving(false);
  };

  const roles = [
    { key: 'master', label: 'Master / Manager', type: 'PIN Angka', icon: <ShieldCheck className="text-slate-700"/>, color: 'bg-slate-100 border-slate-300' },
    { key: 'admin_resi', label: 'Admin Resi', type: 'PIN Angka', icon: <FileSignature className="text-purple-600"/>, color: 'bg-purple-50 border-purple-200' },
    { key: 'admin', label: 'Admin Dispatch', type: 'PIN Angka', icon: <User className="text-[#2596be]"/>, color: 'bg-blue-50 border-blue-200' },
    { key: 'gudang', label: 'Staff Gudang', type: 'PIN Angka', icon: <ClipboardCheck className="text-orange-500"/>, color: 'bg-orange-50 border-orange-200' },
    { key: 'owner', label: 'Pemilik Sistem', type: 'Sandi Huruf/Angka', icon: <Crown className="text-yellow-600"/>, color: 'bg-yellow-50 border-yellow-300' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-yellow-700 to-yellow-500 text-white p-8 rounded-2xl shadow-xl border-b-8 border-yellow-900">
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-wide"><Crown size={32}/> BRANKAS PEMILIK SISTEM</h2>
        <p className="text-yellow-100 font-medium">Perubahan sandi langsung berlaku ke seluruh sistem (Live Sync).</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <h3 className="font-bold text-xl text-slate-800 border-b pb-3 mb-5 flex items-center gap-2"><Key className="text-red-500"/> Pusat Kontrol Akses</h3>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.key} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${role.color}`}>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">{role.icon}</div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{role.label}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Akses Saat ini ({role.type}): 
                    {editingRole !== role.key && <span className="ml-2 text-slate-800 bg-white px-2 py-0.5 rounded border">{systemPins[role.key] || '5555'}</span>}
                  </p>
                </div>
              </div>
              {editingRole === role.key ? (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input type={role.key === 'owner' ? "text" : "password"} className="border-2 border-yellow-500 p-2 rounded-lg w-full md:w-40 font-bold text-center" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Sandi Baru" autoFocus />
                  <button onClick={() => handleSavePin(role.key)} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                  <button onClick={() => setEditingRole(null)} className="bg-slate-300 text-slate-800 font-bold py-2 px-3 rounded-lg">Batal</button>
                </div>
              ) : (
                <button onClick={() => handleEditClick(role.key)} className="bg-white hover:bg-slate-50 border text-slate-700 font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2"><Edit2 size={16}/> Ubah Sandi</button>
              )}
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
  const [showFormDriver, setShowFormDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', pin: '' });
  const [showFormArmada, setShowFormArmada] = useState(false);
  const [newArmada, setNewArmada] = useState({ plat: '', type: 'Pick Up' });

  const toggleDriverStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await fetch(`${supabaseUrl}/drivers?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }) });
    showToast("Status driver diupdate"); refreshData();
  };

  const toggleArmadaStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await fetch(`${supabaseUrl}/armadas?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }) });
    showToast("Status armada diupdate"); refreshData();
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.pin) return alert("Nama dan PIN wajib diisi!");
    const id = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
    await fetch(`${supabaseUrl}/drivers`, { method: 'POST', headers, body: JSON.stringify({ id, name: newDriver.name, phone: newDriver.phone, pin: newDriver.pin, status: 'active' }) });
    setNewDriver({ name: '', phone: '', pin: '' }); setShowFormDriver(false);
    showToast("Supir tersimpan di Cloud!"); refreshData();
  };

  const handleAddArmada = async () => {
    if (!newArmada.plat) return alert("Plat Nomor wajib diisi!");
    const id = `ARM-${Math.floor(1000 + Math.random() * 9000)}`;
    await fetch(`${supabaseUrl}/armadas`, { method: 'POST', headers, body: JSON.stringify({ id, plat: newArmada.plat.toUpperCase(), type: newArmada.type, status: 'active' }) });
    setNewArmada({ plat: '', type: 'Pick Up' }); setShowFormArmada(false);
    showToast("Armada tersimpan di Cloud!"); refreshData();
  };

  const handleDeleteDriver = async (id) => {
    if(window.confirm("Yakin ingin menghapus Supir ini secara permanen?")) {
      await fetch(`${supabaseUrl}/drivers?id=eq.${id}`, { method: 'DELETE', headers });
      showToast("Data Supir dihapus!"); refreshData();
    }
  };

  const handleDeleteArmada = async (id) => {
    if(window.confirm("Yakin ingin menghapus Armada ini secara permanen?")) {
      await fetch(`${supabaseUrl}/armadas?id=eq.${id}`, { method: 'DELETE', headers });
      showToast("Data Armada dihapus!"); refreshData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border-t-4 border-[#2596be]">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><ShieldCheck/> Master Control Panel</h2>
        <p className="text-slate-300">Kelola akses akun Supir dan ketersediaan Armada (Live Sync).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Users className="text-[#2596be]"/> Data Supir</h3>
            <button onClick={() => setShowFormDriver(!showFormDriver)} className="text-[#2596be] bg-[#e0f2fe] px-3 py-1 rounded-lg text-sm font-semibold">{showFormDriver ? 'Batal' : '+ Tambah'}</button>
          </div>
          {showFormDriver && (
            <div className="mb-4 p-4 bg-slate-50 border rounded-lg space-y-3">
              <input type="text" placeholder="Nama Lengkap Supir" className="w-full border p-2 rounded focus:border-[#2596be] outline-none" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
              <input type="text" placeholder="No HP" className="w-full border p-2 rounded focus:border-[#2596be] outline-none" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
              <input type="number" placeholder="Buat PIN (4 Angka)" className="w-full border p-2 rounded focus:border-[#2596be] outline-none" value={newDriver.pin} onChange={e => setNewDriver({...newDriver, pin: e.target.value})} />
              <button onClick={handleAddDriver} className="w-full bg-[#2596be] text-white font-bold py-2 rounded">Simpan ke Cloud</button>
            </div>
          )}
          <div className="space-y-3">
            {drivers.map(drv => (
              <div key={drv.id} className={`flex items-center justify-between p-3 rounded-lg border ${drv.status === 'active' ? 'bg-white' : 'bg-red-50 opacity-70'}`}>
                <div className="flex-1">
                  <p className="font-bold">{drv.name}</p>
                  <p className="text-xs text-slate-500">PIN: {drv.pin} | {drv.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleDriverStatus(drv.id, drv.status)} className={`px-3 py-1 rounded-lg text-xs font-bold ${drv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{drv.status === 'active' ? 'Aktif' : 'Non-aktif'}</button>
                  <button onClick={() => handleDeleteDriver(drv.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Truck className="text-orange-500"/> Data Armada</h3>
            <button onClick={() => setShowFormArmada(!showFormArmada)} className="text-orange-600 bg-orange-50 px-3 py-1 rounded-lg text-sm font-semibold">{showFormArmada ? 'Batal' : '+ Tambah'}</button>
          </div>
          {showFormArmada && (
            <div className="mb-4 p-4 bg-slate-50 border rounded-lg space-y-3">
              <input type="text" placeholder="Plat Nomor" className="w-full border p-2 rounded uppercase focus:border-orange-500 outline-none" value={newArmada.plat} onChange={e => setNewArmada({...newArmada, plat: e.target.value})} />
              <select className="w-full border p-2 rounded focus:border-orange-500 outline-none" value={newArmada.type} onChange={e => setNewArmada({...newArmada, type: e.target.value})}>
                <option value="Pick Up">Pick Up</option><option value="Engkel Bak">Engkel Bak</option><option value="Engkel Box">Engkel Box</option><option value="Truk CDD">Truk CDD</option>
              </select>
              <button onClick={handleAddArmada} className="w-full bg-orange-500 text-white font-bold py-2 rounded">Simpan ke Cloud</button>
            </div>
          )}
          <div className="space-y-3">
            {armadas.map(arm => (
              <div key={arm.id} className={`flex items-center justify-between p-3 rounded-lg border ${arm.status === 'active' ? 'bg-white' : 'bg-red-50 opacity-70'}`}>
                <div className="flex-1">
                  <p className="font-bold">{arm.plat}</p>
                  <p className="text-xs text-slate-500">{arm.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleArmadaStatus(arm.id, arm.status)} className={`px-3 py-1 rounded-lg text-xs font-bold ${arm.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{arm.status === 'active' ? 'Tersedia' : 'Bengkel'}</button>
                  <button onClick={() => handleDeleteArmada(arm.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2A. ADMIN RESI VIEW
// ==========================================
function AdminResiView({ manifests, availableItems, showToast, refreshData, notifications, setNotifications }) {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ resi_manual: '', pengirim: '', penerima: '', alamat: '', kotaAsal: 'Makassar', kotaTujuan: '', pembayaran: 'Lunas', nominalCOD: '', koli: '', berat: '', kubik: '' });
  const [newItemFotoBayar, setNewItemFotoBayar] = useState(null); // State upload foto baru
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [viewPhoto, setViewPhoto] = useState(null);
  const [editingResi, setEditingResi] = useState(null);
  const [editFotoBayar, setEditFotoBayar] = useState(null); // State upload foto edit
  const [searchFilters, setSearchFilters] = useState({ resi: '', tujuan: '', asal: '', penerima: '', pengirim: '' });

  // Fungsi Convert Image ke Base64 (untuk Bukti Lunas/DP Admin)
  const handleUploadFotoAdmin = (e, setTargetState) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTargetState(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateResi = async () => {
    if(!newItem.resi_manual || !newItem.penerima || !newItem.pengirim) return alert("Resi, Pengirim, dan Penerima wajib diisi!");
    if ((newItem.pembayaran === 'DP + Sisa COD') && !newItem.nominalCOD) return alert("Nominal tagihan sisa COD wajib diisi!");
    // Validasi Foto Lunas / DP
    if ((newItem.pembayaran === 'Lunas' || newItem.pembayaran === 'DP + Sisa COD') && !newItemFotoBayar) {
       return alert("Wajib mengunggah Bukti Pembayaran / Transfer!");
    }
    
    setIsPublishing(true);
    try {
      const dbId = `ITM-${Date.now().toString().slice(-6)}${Math.floor(Math.random()*1000)}`;
      const payload = {
        id: dbId, manifest_id: null, resi_manual: newItem.resi_manual, pengirim: newItem.pengirim, penerima: newItem.penerima, 
        alamat: newItem.alamat, kota_asal: newItem.kotaAsal, kota_tujuan: newItem.kotaTujuan, pembayaran: newItem.pembayaran,
        nominal_cod: Number(newItem.nominalCOD)||0, nominal_diterima: 0, koli: Number(newItem.koli)||1, berat: Number(newItem.berat)||0, kubik: 0, 
        status: 'menunggu_jadwal', foto_bayar_url: newItemFotoBayar || null
      };
      
      let res = await fetch(`${supabaseUrl}/items`, { method: 'POST', headers, body: JSON.stringify([payload]) });
      if(!res.ok) throw new Error("Gagal menyimpan ke database");

      showToast("Resi berhasil ditambahkan ke Server!");
      setNewItem({ resi_manual: '', pengirim: '', penerima: '', alamat: '', kotaAsal: 'Makassar', kotaTujuan: '', pembayaran: 'Lunas', nominalCOD: '', koli: '', berat: '', kubik: '' });
      setNewItemFotoBayar(null);
      setShowForm(false);
      refreshData();
    } catch(e) { alert("GAGAL MENYIMPAN: " + e.message); }
    setIsPublishing(false);
  };

  const handleSaveEditResi = async () => {
    try {
      const payload = {
        resi_manual: editingResi.resi_manual, pengirim: editingResi.pengirim, penerima: editingResi.penerima,
        koli: Number(editingResi.koli), berat: Number(editingResi.berat), nominal_cod: Number(editingResi.nominal_cod), pembayaran: editingResi.pembayaran
      };
      if (editFotoBayar) payload.foto_bayar_url = editFotoBayar;

      await fetch(`${supabaseUrl}/items?id=eq.${editingResi.id}`, { method: 'PATCH', headers, body: JSON.stringify(payload) });
      showToast("Perubahan Resi Disimpan!"); 
      setEditingResi(null); setEditFotoBayar(null); 
      refreshData();
    } catch(e) { alert("Gagal menyimpan perubahan"); }
  };

  const handleDeleteItem = async (itemId) => {
    if(window.confirm(`Hapus Resi ini permanen?`)) {
      try {
        await fetch(`${supabaseUrl}/items?id=eq.${itemId}`, { method: 'DELETE', headers });
        showToast("Resi dihapus!"); refreshData();
      } catch(e) { alert("Gagal menghapus"); }
    }
  };

  const handleDeleteManifestAdminResi = async (manifestId) => {
    if(window.confirm(`YAKIN INGIN MENGHAPUS MANIFEST ${manifestId}?\nSemua data di dalamnya akan terhapus. (Gunakan untuk bersih-bersih data uji coba)`)) {
      try {
        await fetch(`${supabaseUrl}/manifests?id=eq.${manifestId}`, { method: 'DELETE', headers });
        showToast(`Manifest ${manifestId} berhasil dihapus!`); refreshData();
      } catch(e) { alert("Gagal menghapus Manifest"); }
    }
  };

  const handleBackup = () => {
    let csv = "Tanggal,ID Manifest,Status Truk,Driver,No. Resi,Pengirim,Penerima,Alamat,Kota Asal,Kota Tujuan,Muatan (Koli/Kg),Status Resi,Pembayaran,Tagihan COD\n";
    manifests.forEach(m => {
      m.items.forEach(it => {
        csv += `"${new Date().toLocaleDateString('id-ID')}","${m.id}","${m.status}","${m.driver}","${it.resi_manual}","${it.pengirim || ''}","${it.penerima}","${it.alamat}","${it.kotaAsal}","${it.kotaTujuan}","${it.koli} Koli / ${it.berat} Kg","${it.status}","${it.pembayaran}","${it.nominalCOD}"\n`;
      });
    });
    availableItems.forEach(it => {
      csv += `"${new Date().toLocaleDateString('id-ID')}","BELUM DIJADWALKAN","-","-","${it.resi_manual}","${it.pengirim || ''}","${it.penerima}","${it.alamat}","${it.kota_asal}","${it.kota_tujuan}","${it.koli} Koli / ${it.berat} Kg","${it.status}","${it.pembayaran}","${it.nominal_cod}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Resi_KamilLogistik_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast("Data diekspor ke CSV!");
  };

  const filteredAvailable = availableItems.filter(it => {
    const matchResi = !searchFilters.resi || (it.resi_manual && it.resi_manual.toLowerCase().includes(searchFilters.resi.toLowerCase()));
    const matchTujuan = !searchFilters.tujuan || (it.kota_tujuan && it.kota_tujuan.toLowerCase().includes(searchFilters.tujuan.toLowerCase()));
    const matchAsal = !searchFilters.asal || (it.kota_asal && it.kota_asal.toLowerCase().includes(searchFilters.asal.toLowerCase()));
    const matchPenerima = !searchFilters.penerima || (it.penerima && it.penerima.toLowerCase().includes(searchFilters.penerima.toLowerCase()));
    const matchPengirim = !searchFilters.pengirim || (it.pengirim && it.pengirim.toLowerCase().includes(searchFilters.pengirim.toLowerCase()));
    return matchResi && matchTujuan && matchAsal && matchPenerima && matchPengirim;
  });

  const filteredManifests = manifests.map(mnf => {
    const filteredItems = mnf.items.filter(it => {
      const matchResi = !searchFilters.resi || (it.resi_manual && it.resi_manual.toLowerCase().includes(searchFilters.resi.toLowerCase()));
      const matchTujuan = !searchFilters.tujuan || (it.kotaTujuan && it.kotaTujuan.toLowerCase().includes(searchFilters.tujuan.toLowerCase())) || (mnf.tujuan && mnf.tujuan.toLowerCase().includes(searchFilters.tujuan.toLowerCase()));
      const matchAsal = !searchFilters.asal || (it.kotaAsal && it.kotaAsal.toLowerCase().includes(searchFilters.asal.toLowerCase()));
      const matchPenerima = !searchFilters.penerima || (it.penerima && it.penerima.toLowerCase().includes(searchFilters.penerima.toLowerCase()));
      const matchPengirim = !searchFilters.pengirim || (it.pengirim && it.pengirim.toLowerCase().includes(searchFilters.pengirim.toLowerCase()));
      return matchResi && matchTujuan && matchAsal && matchPenerima && matchPengirim;
    });
    return { ...mnf, items: filteredItems };
  }).filter(mnf => mnf.items.length > 0 || (searchFilters.resi === '' && searchFilters.tujuan === '' && searchFilters.asal === '' && searchFilters.penerima === '' && searchFilters.pengirim === '' && mnf.id.toLowerCase().includes(searchFilters.resi.toLowerCase())));

  return (
    <div className="space-y-6 print:space-y-12">
      <div className="bg-purple-900 text-white p-6 rounded-xl shadow-lg border-t-4 border-purple-400">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FileSignature/> Ruang Kerja Admin Resi</h2>
        <p className="text-purple-200">Input resi baru di sini. Resi akan ditarik oleh Admin Dispatch ke dalam manifest armada.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4 print:hidden">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1"><Search size={16}/> Saring Pencarian Laporan</h2>
          <button onClick={handleBackup} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm font-bold text-xs transition">
            <Download size={14} /> Ekspor Laporan Excel
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          <input type="text" placeholder="No. Resi" className="w-full border-2 border-slate-200 py-2 px-3 rounded-lg text-xs focus:border-purple-500 outline-none font-semibold" value={searchFilters.resi} onChange={e => setSearchFilters({...searchFilters, resi: e.target.value})} />
          <input type="text" placeholder="Kota Asal" className="w-full border-2 border-slate-200 py-2 px-3 rounded-lg text-xs focus:border-purple-500 outline-none font-semibold" value={searchFilters.asal} onChange={e => setSearchFilters({...searchFilters, asal: e.target.value})} />
          <input type="text" placeholder="Kota Tujuan" className="w-full border-2 border-slate-200 py-2 px-3 rounded-lg text-xs focus:border-purple-500 outline-none font-semibold" value={searchFilters.tujuan} onChange={e => setSearchFilters({...searchFilters, tujuan: e.target.value})} />
          <input type="text" placeholder="Nama Pengirim" className="w-full border-2 border-slate-200 py-2 px-3 rounded-lg text-xs focus:border-purple-500 outline-none font-semibold" value={searchFilters.pengirim} onChange={e => setSearchFilters({...searchFilters, pengirim: e.target.value})} />
          <input type="text" placeholder="Nama Penerima" className="w-full border-2 border-slate-200 py-2 px-3 rounded-lg text-xs focus:border-purple-500 outline-none font-semibold" value={searchFilters.penerima} onChange={e => setSearchFilters({...searchFilters, penerima: e.target.value})} />
        </div>
        <div className="flex justify-end pt-1">
          <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-bold text-sm transition">
            {showForm ? 'Batal Input' : <><Plus size={18} /> Ketik Data Resi Baru</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200 print:hidden animate-fade-in-down">
          <h3 className="font-bold text-lg border-b pb-2 mb-4 text-purple-800">Formulir Resi Baru (Menunggu Jadwal)</h3>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input className="border p-2.5 rounded-lg text-sm bg-white focus:border-purple-500" placeholder="No Resi Manual" value={newItem.resi_manual} onChange={e => setNewItem({...newItem, resi_manual: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm bg-white focus:border-purple-500" placeholder="Nama Pengirim" value={newItem.pengirim} onChange={e => setNewItem({...newItem, pengirim: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm bg-white focus:border-purple-500" placeholder="Nama Penerima" value={newItem.penerima} onChange={e => setNewItem({...newItem, penerima: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input className="border p-2.5 rounded-lg text-sm bg-white focus:border-purple-500" placeholder="Kota Asal" value={newItem.kotaAsal} onChange={e => setNewItem({...newItem, kotaAsal: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm bg-white focus:border-purple-500" placeholder="Kota Tujuan" value={newItem.kotaTujuan} onChange={e => setNewItem({...newItem, kotaTujuan: e.target.value})} />
              <select className="border p-2.5 rounded-lg text-sm font-semibold focus:border-purple-500" value={newItem.pembayaran} onChange={e => { setNewItem({...newItem, pembayaran: e.target.value, nominalCOD: ''}); setNewItemFotoBayar(null); }}>
                <option value="Lunas">💳 Lunas</option><option value="Invoice">📄 Invoice (B2B)</option><option value="COD (Belum Lunas)">💰 COD (Full)</option><option value="DP + Sisa COD">💵 DP + Sisa COD</option>
              </select>
            </div>
            
            {(newItem.pembayaran === 'COD (Belum Lunas)' || newItem.pembayaran === 'DP + Sisa COD') && (
              <div className="mb-3 bg-yellow-50 p-3.5 rounded-lg border border-yellow-300 flex items-center gap-3">
                <Banknote className="text-yellow-600 w-8 h-8"/>
                <div className="flex-1"><label className="text-xs font-bold text-yellow-800">Tagihan Kurir (Sisa COD Rp):</label><input type="number" className="w-full border-2 border-yellow-200 p-2 rounded-lg text-sm mt-1 font-bold" value={newItem.nominalCOD} onChange={e => setNewItem({...newItem, nominalCOD: e.target.value})} /></div>
              </div>
            )}

            {/* AREA UPLOAD BUKTI (LUNAS / DP) */}
            {(newItem.pembayaran === 'Lunas' || newItem.pembayaran === 'DP + Sisa COD') && (
              <div className="mb-3 bg-blue-50 p-3.5 rounded-lg border border-blue-200">
                <label className="text-xs font-bold text-blue-800 mb-2 block">Upload Bukti Pembayaran / Transfer (Wajib):</label>
                <div className="border-2 border-dashed border-blue-400 bg-white rounded-lg p-2 text-center relative overflow-hidden h-24 flex items-center justify-center cursor-pointer">
                   <input type="file" accept="image/*" onChange={(e) => handleUploadFotoAdmin(e, setNewItemFotoBayar)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   {newItemFotoBayar ? <img src={newItemFotoBayar} className="h-full object-contain" alt="Bukti" /> : <p className="text-sm text-blue-600 font-bold">Pilih Foto Bukti...</p>}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-3">
              <input className="border p-2.5 rounded-lg text-sm w-20 focus:border-purple-500" placeholder="Koli" type="number" value={newItem.koli} onChange={e => setNewItem({...newItem, koli: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm w-24 bg-white shadow-inner focus:border-purple-500" placeholder="Berat(Kg)" type="number" value={newItem.berat} onChange={e => setNewItem({...newItem, berat: e.target.value})} />
              <input className="border p-2.5 rounded-lg text-sm flex-1 focus:border-purple-500" placeholder="Alamat Lengkap" value={newItem.alamat} onChange={e => setNewItem({...newItem, alamat: e.target.value})} />
            </div>
          </div>
          <button onClick={handleCreateResi} disabled={isPublishing} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-lg">{isPublishing ? 'Menyimpan...' : 'Simpan Data Resi ke Server'}</button>
        </div>
      )}

      {filteredAvailable.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-8 border-t-amber-400">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div><h3 className="font-black text-xl uppercase tracking-wider text-slate-900">RESI MENUNGGU JADWAL TRUK</h3><p className="text-sm text-slate-500">Resi ini siap ditarik oleh Admin Dispatch ke dalam manifest.</p></div>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded font-bold text-sm">{filteredAvailable.length} Resi Tersedia</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b">
                  <th className="p-3 font-semibold">No. Resi</th>
                  <th className="p-3 font-semibold">Pengirim</th>
                  <th className="p-3 font-semibold">Penerima & Alamat</th>
                  <th className="p-3 font-semibold">Kota Asal</th>
                  <th className="p-3 font-semibold">Kota Tujuan</th>
                  <th className="p-3 text-center font-semibold">Muatan</th>
                  <th className="p-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAvailable.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{it.resi_manual}</div>
                      <div className="text-[10px] font-bold mt-1 inline-block bg-slate-200 px-1 rounded">{it.pembayaran}</div>
                      {it.nominal_cod > 0 && <div className="text-[10px] font-bold mt-1 text-red-600">Tagih: {formatRp(it.nominal_cod)}</div>}
                      {it.foto_bayar_url && <button onClick={() => setViewPhoto(it.foto_bayar_url)} className="text-[10px] text-blue-600 block mt-1 underline font-bold">Lihat Bukti</button>}
                    </td>
                    <td className="p-3 font-semibold text-amber-800">{it.pengirim || '-'}</td>
                    <td className="p-3"><strong>{it.penerima}</strong><div className="text-xs text-slate-500">{it.alamat}</div></td>
                    <td className="p-3 font-bold text-slate-700">{it.kota_asal}</td>
                    <td className="p-3 font-bold text-slate-700">{it.kota_tujuan}</td>
                    <td className="p-3 text-center"><div className="font-bold">{it.koli} Koli</div><div className="text-xs text-[#2596be] font-bold">{it.berat} Kg</div></td>
                    <td className="p-3 text-center">
                       <div className="flex items-center justify-center gap-2">
                         <button onClick={() => {setEditingResi({id: it.id, resi_manual: it.resi_manual, pengirim: it.pengirim||'', penerima: it.penerima, koli: it.koli, berat: it.berat, nominal_cod: it.nominal_cod, pembayaran: it.pembayaran}); setEditFotoBayar(null);}} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded"><Edit2 size={14}/></button>
                         <button onClick={() => handleDeleteItem(it.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash2 size={14}/></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANIFEST LIST (ADMIN RESI BISA MENGHAPUS MANIFEST UNTUK UJI COBA) */}
      <div className="grid gap-6 print:block print:space-y-12">
        {filteredManifests.length === 0 && filteredAvailable.length === 0 && <div className="text-center text-slate-400 py-10 font-medium">Tidak ada data Laporan yang cocok</div>}
        {filteredManifests.map(mnf => (
          <div key={mnf.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-8 border-t-[#2596be] print:shadow-none print:border-2 print:border-black print:rounded-none print:m-0 print:break-inside-avoid print:p-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5 print:border-none print:mb-0 print:pb-0">
              <div className="print:hidden">
                <h3 className="font-black text-2xl uppercase tracking-widest text-slate-900">{mnf.id}</h3>
                <p className="text-slate-500 mt-1 font-medium">Tanggal: {new Date().toLocaleDateString('id-ID')} | Area Tujuan: <span className="font-bold text-[#2596be]">{mnf.tujuan}</span></p>
                <p className="text-xs font-bold mt-1 text-slate-600">Supir: {mnf.driver} | Plat: {mnf.armada}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2 print:hidden">
                <StatusBadge status={mnf.status} />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => window.print()} className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={16}/> Cetak</button>
                  {/* TOMBOL HAPUS MANIFEST KHUSUS ADMIN RESI */}
                  <button onClick={() => handleDeleteManifestAdminResi(mnf.id)} className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Trash2 size={16}/> Hapus Manifest</button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200 print:rounded-none print:border-black">
              <table className="w-full text-left text-sm print:text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b print:border-black print:bg-gray-200">
                    <th className="p-3 font-semibold">No. Resi</th>
                    <th className="p-3 font-semibold">Pengirim</th>
                    <th className="p-3 font-semibold">Penerima & Alamat</th>
                    <th className="p-3 font-semibold">Kota Asal</th>
                    <th className="p-3 font-semibold">Kota Tujuan</th>
                    <th className="p-3 text-center font-semibold">Muatan</th>
                    <th className="p-3 text-center font-semibold">Status & Bukti Foto</th>
                    <th className="p-3 text-center font-semibold print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                  {mnf.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50 transition print:hover:bg-white">
                      <td className="p-3 print:border-r print:border-black">
                        <div className="font-bold text-slate-900">{it.resi_manual}</div>
                        <div className="text-[10px] font-bold mt-1 print:border print:border-black print:px-1 print:inline-block">{it.pembayaran}</div>
                        {it.nominalCOD > 0 && <div className="text-[10px] font-bold mt-1 text-red-600">Tagih: {formatRp(it.nominalCOD)}</div>}
                      </td>
                      <td className="p-3 print:border-r print:border-black font-semibold text-amber-800">{it.pengirim || '-'}</td>
                      <td className="p-3 print:border-r print:border-black"><strong>{it.penerima}</strong><div className="text-xs text-slate-500">{it.alamat}</div></td>
                      <td className="p-3 print:border-r print:border-black font-bold text-slate-700">{it.kotaAsal}</td>
                      <td className="p-3 print:border-r print:border-black font-bold text-slate-700">{it.kotaTujuan}</td>
                      <td className="p-3 text-center print:border-r print:border-black"><div className="font-bold">{it.koli} Koli</div><div className="text-xs text-[#2596be] font-bold">{it.berat} Kg</div></td>
                      <td className="p-3 print:w-32 print:text-center">
                         <div className="hidden print:block w-full h-12 border-b border-dashed border-gray-400 mt-2"></div>
                         <div className="flex flex-col items-center gap-1.5 print:hidden">
                           <ItemStatusBadge status={it.status} />
                           {(it.fotoResiUrl || it.fotoBarangUrl || it.fotoBayarUrl) && (
                             <div className="flex flex-wrap gap-1 mt-1 justify-center max-w-[120px]">
                               {it.fotoResiUrl && <button onClick={() => setViewPhoto(it.fotoResiUrl)} className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-1 rounded font-bold flex items-center gap-1"><ImageIcon size={10}/> Resi</button>}
                               {it.fotoBarangUrl && <button onClick={() => setViewPhoto(it.fotoBarangUrl)} className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-1 rounded font-bold flex items-center gap-1"><ImageIcon size={10}/> Brg</button>}
                               {it.fotoBayarUrl && <button onClick={() => setViewPhoto(it.fotoBayarUrl)} className="text-[9px] bg-green-100 text-green-700 px-1.5 py-1 rounded font-bold flex items-center gap-1"><Banknote size={10}/> Uang</button>}
                             </div>
                           )}
                           {it.catatan && <p className="text-[10px] text-slate-500 italic mt-1 bg-white border px-1 w-full text-center truncate max-w-[120px]" title={it.catatan}>"{it.catatan}"</p>}
                         </div>
                      </td>
                      <td className="p-3 text-center print:hidden">
                         <div className="flex items-center justify-center gap-2">
                           <button onClick={() => {setEditingResi({id: it.id, resi_manual: it.resi_manual, pengirim: it.pengirim || '', penerima: it.penerima, koli: it.koli, berat: it.berat, nominal_cod: it.nominalCOD, pembayaran: it.pembayaran}); setEditFotoBayar(null);}} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded"><Edit2 size={14}/></button>
                           <button onClick={() => handleDeleteItem(it.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash2 size={14}/></button>
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

      {editingResi && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border-t-8 border-t-purple-600">
            <h3 className="font-bold text-lg border-b pb-2 mb-4">Edit Data Resi</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500">No. Resi</label><input className="w-full border p-2 rounded outline-none" value={editingResi.resi_manual} onChange={e=>setEditingResi({...editingResi, resi_manual: e.target.value})}/></div>
              <div><label className="text-xs font-bold text-gray-500">Nama Pengirim</label><input className="w-full border p-2 rounded outline-none" value={editingResi.pengirim} onChange={e=>setEditingResi({...editingResi, pengirim: e.target.value})}/></div>
              <div><label className="text-xs font-bold text-gray-500">Nama Penerima</label><input className="w-full border p-2 rounded outline-none" value={editingResi.penerima} onChange={e=>setEditingResi({...editingResi, penerima: e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500">Koli</label><input type="number" className="w-full border p-2 rounded" value={editingResi.koli} onChange={e=>setEditingResi({...editingResi, koli: e.target.value})}/></div>
                <div><label className="text-xs font-bold text-gray-500">Berat (Kg)</label><input type="number" className="w-full border p-2 rounded" value={editingResi.berat} onChange={e=>setEditingResi({...editingResi, berat: e.target.value})}/></div>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Tipe Pembayaran</label>
                <select className="w-full border p-2 rounded" value={editingResi.pembayaran} onChange={e=>setEditingResi({...editingResi, pembayaran: e.target.value})}>
                  <option value="Lunas">Lunas</option><option value="Invoice">Invoice</option><option value="COD (Belum Lunas)">COD</option><option value="DP + Sisa COD">DP + Sisa COD</option>
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Tagihan COD (Rp)</label><input type="number" className="w-full border p-2 rounded" value={editingResi.nominal_cod} onChange={e=>setEditingResi({...editingResi, nominal_cod: e.target.value})}/></div>
              
              {(editingResi.pembayaran === 'Lunas' || editingResi.pembayaran === 'DP + Sisa COD') && (
                <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-2 text-center relative overflow-hidden h-20 flex items-center justify-center cursor-pointer mt-2">
                   <input type="file" accept="image/*" onChange={(e) => handleUploadFotoAdmin(e, setEditFotoBayar)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   {editFotoBayar ? <img src={editFotoBayar} className="h-full object-contain" alt="Bukti" /> : <p className="text-xs text-blue-600 font-bold">Upload/Ganti Foto Bukti Bayar...</p>}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEditResi} className="flex-1 bg-green-600 text-white font-bold py-2 rounded">Simpan</button>
              <button onClick={() => {setEditingResi(null); setEditFotoBayar(null);}} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded">Batal</button>
            </div>
          </div>
        </div>
      )}

      {viewPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4" onClick={() => setViewPhoto(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewPhoto(null)} className="absolute -top-12 right-0 text-white font-bold bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">Tutup Foto (X)</button>
            <img src={viewPhoto} className="w-full h-auto rounded-xl shadow-2xl border-4 border-white" alt="Bukti Foto" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2B. ADMIN DISPATCH VIEW (SEARCH BOX)
// ==========================================
function AdminDispatchView({ manifests, availableItems, drivers, armadas, showToast, refreshData }) {
  const [showForm, setShowForm] = useState(false);
  const [newManifest, setNewManifest] = useState({ driver: '', armada: '', tujuan: '', items: [] });
  const [searchResiTerm, setSearchResiTerm] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const activeDrivers = drivers.filter(d => d.status === 'active');
  const activeArmadas = armadas.filter(a => a.status === 'active');

  // Filter pencarian untuk daftar tarik resi
  const filteredAvailableForTruck = availableItems.filter(it => 
    !newManifest.items.find(i => i.id === it.id) && // Hilangkan yang sudah ditarik ke box bawah
    (it.resi_manual.toLowerCase().includes(searchResiTerm.toLowerCase()) || 
     it.penerima.toLowerCase().includes(searchResiTerm.toLowerCase()) ||
     it.kota_tujuan.toLowerCase().includes(searchResiTerm.toLowerCase()))
  );

  const addResiToManifest = (item) => {
    setNewManifest({ ...newManifest, items: [...newManifest.items, item] });
    setSearchResiTerm(''); // Reset pencarian setelah ditambah
  };

  const removeResiFromManifest = (id) => {
    setNewManifest({ ...newManifest, items: newManifest.items.filter(i => i.id !== id) });
  };

  const handleCreateManifest = async () => {
    if(!newManifest.driver || !newManifest.armada) return alert("Pilih Driver dan Armada!");
    if(newManifest.items.length === 0) return alert("Minimal masukkan 1 resi ke dalam truk!");
    setIsPublishing(true);
    
    try {
      const manifestId = `MNF-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000)}`;
      let resMnf = await fetch(`${supabaseUrl}/manifests`, {
        method: 'POST', headers,
        body: JSON.stringify({ id: manifestId, driver: newManifest.driver, armada: newManifest.armada, tujuan: newManifest.tujuan, status: 'loading' })
      });
      if (!resMnf.ok) throw new Error("Gagal menyimpan ke tabel manifests");

      for(let it of newManifest.items) {
        await fetch(`${supabaseUrl}/items?id=eq.${it.id}`, { method: 'PATCH', headers, body: JSON.stringify({ manifest_id: manifestId, status: 'pending' }) });
      }

      showToast("Truk berhasil diberangkatkan ke Gudang!");
      setShowForm(false);
      setNewManifest({ driver: '', armada: '', tujuan: '', items: [] });
      refreshData();
    } catch(err) { alert(`GAGAL:\n${err.message}`); }
    setIsPublishing(false);
  };

  const handleDeleteManifest = async (id) => {
    if(window.confirm(`YAKIN INGIN MENGHAPUS MANIFEST ${id}?\nResi di dalamnya akan kembali berstatus "Menunggu Jadwal".`)) {
      try {
        await fetch(`${supabaseUrl}/manifests?id=eq.${id}`, { method: 'DELETE', headers });
        showToast("Manifest berhasil dibatalkan!"); refreshData();
      } catch(e) { alert("Gagal menghapus"); }
    }
  };

  return (
    <div className="space-y-6 print:space-y-12">
      <div className="bg-[#2596be] text-white p-6 rounded-xl shadow-lg border-t-4 border-blue-300 print:hidden">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Truck/> Panel Admin Dispatch</h2>
        <p className="text-blue-100">Susun Truk dan tarik resi yang sudah diinput oleh Admin Resi ke dalam Manifest ini.</p>
      </div>

      <div className="flex justify-between items-center print:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Daftar Manifest Tersedia</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#2596be] hover:bg-[#1e7a9c] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-bold text-sm transition">
          {showForm ? 'Batal' : <><Plus size={18} /> Susun Manifest Truk</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 print:hidden animate-fade-in-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select className="border-2 border-slate-200 p-2.5 rounded-lg focus:border-[#2596be] outline-none font-bold" value={newManifest.driver} onChange={e => setNewManifest({...newManifest, driver: e.target.value})}>
              <option value="">-- PILIH SUPIR --</option>{activeDrivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <select className="border-2 border-slate-200 p-2.5 rounded-lg focus:border-[#2596be] outline-none font-bold" value={newManifest.armada} onChange={e => setNewManifest({...newManifest, armada: e.target.value})}>
              <option value="">-- PILIH ARMADA --</option>{activeArmadas.map(a => <option key={a.id} value={`${a.plat} (${a.type})`}>{a.plat} ({a.type})</option>)}
            </select>
            <input className="border-2 border-slate-200 p-2.5 rounded-lg focus:border-[#2596be] outline-none font-bold" placeholder="Tujuan Truk (Area)" value={newManifest.tujuan} onChange={e => setNewManifest({...newManifest, tujuan: e.target.value})} />
          </div>
          
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 mb-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Search size={18}/> Cari & Tarik Resi ke dalam Truk:</h4>
            
            {/* KOTAK PENCARIAN BARU */}
            <input type="text" placeholder="Ketik No. Resi, Nama Penerima, atau Kota Tujuan..." className="w-full border-2 border-blue-300 p-3 rounded-lg outline-none focus:border-[#2596be] font-bold text-slate-700 mb-3 shadow-inner" value={searchResiTerm} onChange={e => setSearchResiTerm(e.target.value)} />
            
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {filteredAvailableForTruck.length === 0 ? (
                <p className="text-sm text-blue-700 font-medium text-center py-4">{searchResiTerm ? 'Tidak ditemukan resi yang cocok' : 'Ketik di atas untuk mencari resi, atau tarik dari daftar ini'}</p>
              ) : (
                filteredAvailableForTruck.slice(0, 10).map(it => ( // Batasi tampilan 10 agar tidak terlalu panjang
                  <div key={it.id} className="bg-white p-3 rounded-lg border border-blue-200 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="font-bold text-[#2596be]">{it.resi_manual}</span> | {it.pengirim} ➔ <strong>{it.penerima}</strong>
                      <p className="text-xs text-slate-500 mt-1">{it.kota_tujuan} | {it.koli} Koli</p>
                    </div>
                    <button onClick={() => addResiToManifest(it)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-md shadow-sm transition">Tambah +</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold mb-2">Daftar Muatan di dalam Truk ({newManifest.items.length}):</p>
            {newManifest.items.length === 0 && <p className="text-xs text-slate-400 italic">Belum ada resi ditarik</p>}
            {newManifest.items.map((it, idx) => (
              <div key={idx} className="text-sm bg-white p-3 rounded-lg border border-slate-200 mb-2 flex justify-between items-center shadow-sm">
                <div>
                  <span className="font-bold text-lg">{it.resi_manual}</span> - Pengirim: <span className="font-bold text-amber-700">{it.pengirim}</span> ➔ Penerima: <span className="font-bold">{it.penerima}</span>
                  <div className="text-xs text-slate-500 mt-0.5">{it.kota_asal} ➔ {it.kota_tujuan} | <span className="font-semibold text-[#2596be]">{it.koli} Koli / {it.berat} Kg</span></div>
                </div>
                <button onClick={() => removeResiFromManifest(it.id)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 p-2 rounded-lg">Batal Tarik</button>
              </div>
            ))}
          </div>
          <button onClick={handleCreateManifest} disabled={isPublishing} className="w-full bg-[#2596be] hover:bg-[#1e7a9c] text-white font-bold py-4 rounded-xl shadow-lg transition text-lg uppercase tracking-widest">{isPublishing ? 'Menerbitkan...' : 'Terbitkan Manifest ke Gudang'}</button>
        </div>
      )}

      {/* MANIFEST LIST UNTUK PRINT DISPATCH */}
      <div className="grid gap-6 print:block print:space-y-12">
        {manifests.length === 0 && <div className="text-center text-slate-400 py-10 font-medium">Belum ada Manifest dibuat.</div>}
        {manifests.map(mnf => (
          <div key={mnf.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-8 border-t-[#2596be] print:shadow-none print:border-2 print:border-black print:rounded-none print:m-0 print:break-inside-avoid print:p-8">
            <div className="hidden print:flex items-center justify-between mb-8 border-b-2 border-black pb-4">
              <BrandLogo />
              <div className="text-right"><h1 className="text-2xl font-black uppercase">SURAT JALAN / MANIFEST</h1><p className="text-sm font-bold text-gray-600">No: {mnf.id}</p></div>
            </div>

            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5 print:border-none print:mb-0 print:pb-0">
              <div className="print:hidden">
                <h3 className="font-black text-2xl uppercase tracking-widest text-slate-900">{mnf.id}</h3>
                <p className="text-slate-500 mt-1 font-medium">Tanggal: {new Date().toLocaleDateString('id-ID')} | Area Tujuan: <span className="font-bold text-[#2596be]">{mnf.tujuan}</span></p>
              </div>
              <div className="text-right flex flex-col items-end gap-2 print:hidden">
                <StatusBadge status={mnf.status} />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => window.print()} className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={16}/> Cetak</button>
                  <button onClick={() => handleDeleteManifest(mnf.id)} className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Trash2 size={16}/> Batalkan Manifest</button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-black print:rounded-none print:mt-4 print:mb-6">
              <div className="print:hidden"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nama Supir</p><p className="font-bold text-lg text-slate-800">{mnf.driver}</p></div>
              <div className="print:hidden"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Armada</p><p className="font-bold text-lg text-slate-800">{mnf.armada}</p></div>
              <div className="hidden print:block text-sm"><span className="inline-block w-24">Tanggal</span>: {new Date().toLocaleDateString('id-ID')}<br/><span className="inline-block w-24">Tujuan Area</span>: <strong>{mnf.tujuan}</strong></div>
              <div className="hidden print:block text-sm"><span className="inline-block w-24">Nama Supir</span>: {mnf.driver}<br/><span className="inline-block w-24">Armada/Plat</span>: <strong>{mnf.armada}</strong></div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 print:rounded-none print:border-black">
              <table className="w-full text-left text-sm print:text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b print:border-black print:bg-gray-200">
                    <th className="p-3 font-semibold">No. Resi</th>
                    <th className="p-3 font-semibold">Pengirim</th>
                    <th className="p-3 font-semibold">Penerima & Alamat</th>
                    <th className="p-3 font-semibold">Kota Asal</th>
                    <th className="p-3 font-semibold">Kota Tujuan</th>
                    <th className="p-3 text-center font-semibold">Muatan</th>
                    <th className="p-3 text-center font-semibold print:hidden">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                  {mnf.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50 transition print:hover:bg-white">
                      <td className="p-3 print:border-r print:border-black font-bold text-slate-900">{it.resi_manual}</td>
                      <td className="p-3 print:border-r print:border-black font-semibold text-amber-800">{it.pengirim || '-'}</td>
                      <td className="p-3 print:border-r print:border-black"><strong>{it.penerima}</strong><div className="text-xs text-slate-500">{it.alamat}</div></td>
                      <td className="p-3 print:border-r print:border-black font-bold text-slate-700">{it.kotaAsal}</td>
                      <td className="p-3 print:border-r print:border-black font-bold text-slate-700">{it.kotaTujuan}</td>
                      <td className="p-3 text-center print:border-r print:border-black"><div className="font-bold">{it.koli} Koli</div><div className="text-xs text-[#2596be] font-bold">{it.berat} Kg</div></td>
                      <td className="p-3 text-center print:hidden">
                        <div className="text-[10px] font-bold inline-block bg-slate-200 px-2 py-1 rounded uppercase">{it.pembayaran}</div>
                        {it.nominalCOD > 0 && <div className="text-[10px] font-bold mt-1 text-red-600">Tagih: {formatRp(it.nominalCOD)}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. GUDANG VIEW 
// ==========================================
function GudangView({ manifests, addNotification, showToast, refreshData }) {
  // Hanya tampilkan manifest yang statusnya 'loading'
  const loadingManifests = manifests.filter(m => m.status === 'loading');
  const [picStaff, setPicStaff] = useState({}); // Menyimpan nama PIC per manifest id

  const dispatchManifest = async (manifestId) => {
    const staffName = picStaff[manifestId];
    if (!staffName || staffName.trim() === '') {
      return alert("Harap isi Nama Staff Penanggung Jawab sebelum memberangkatkan truk!");
    }

    try {
      // Kita update status jadi on_delivery, dan tambahkan catatan PIC ke field tujuan (atau biarkan di local)
      await fetch(`${supabaseUrl}/manifests?id=eq.${manifestId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'on_delivery' }) });
      showToast("Truk berhasil diberangkatkan! Manifest hilang dari layar Gudang."); 
      refreshData();
    } catch(err) { alert("Gagal koneksi ke Cloud."); }
  };

  const handleChecklist = async (manifestId, itemId, action) => {
    await fetch(`${supabaseUrl}/items?id=eq.${itemId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: action === 'load' ? 'loaded' : 'issue' }) });
    if (action === 'issue') addNotification(`🚨 Gudang: Resi manual dikeluhkan bermasalah!`);
    refreshData();
  };

  const handleDeleteManifestGudang = async (manifestId) => {
    if(window.confirm(`YAKIN INGIN MENGHAPUS MANIFEST ${manifestId} DARI GUDANG?\n(Semua resi di dalamnya akan terhapus. Gunakan untuk bersihkan data dummy)`)) {
      try {
        await fetch(`${supabaseUrl}/manifests?id=eq.${manifestId}`, { method: 'DELETE', headers });
        showToast("Manifest Dummy dihapus!"); refreshData();
      } catch(e) { alert("Gagal menghapus Manifest"); }
    }
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
        // Harus semua item memiliki status 'loaded' atau 'issue' baru bisa diberangkatkan
        const isReadyToDispatch = mnf.items.length > 0 && mnf.items.every(i => i.status === 'loaded' || i.status === 'issue');
        
        return (
          <div key={mnf.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 mb-6">
            <div className="bg-orange-500 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-xl">{mnf.id}</h3>
              {/* TOMBOL HAPUS MANIFEST DARI GUDANG */}
              <button onClick={() => handleDeleteManifestGudang(mnf.id)} className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-lg transition" title="Hapus Manifest Dummy"><Trash2 size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              {mnf.items.map(it => (
                <div key={it.id} className={`p-4 rounded-xl border ${it.status === 'loaded' ? 'bg-green-50 border-green-300' : 'bg-slate-50'}`}>
                  <div className="flex justify-between mb-2"><div><p className="font-bold">{it.resi_manual}</p><p className="text-xs">{it.penerima}</p></div>
                  <div>{it.status === 'loaded' && <CheckCircle2 className="text-green-500 w-8 h-8"/>}</div></div>
                  {it.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t"><button onClick={() => handleChecklist(mnf.id, it.id, 'load')} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-1"><CheckCircle2 size={16}/> Masuk Truk</button><button onClick={() => handleChecklist(mnf.id, it.id, 'issue')} className="bg-red-100 text-red-700 font-bold py-2 px-3 rounded-lg text-sm flex gap-1"><AlertOctagon size={16}/> Lapor Kurang</button></div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-50 border-t space-y-4">
              {/* INPUT NAMA STAFF PENANGGUNG JAWAB (PIC) */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Staff Penanggung Jawab Muat (Wajib):</label>
                <input type="text" placeholder="Cth: Budi & Yanto" className="w-full border-2 border-slate-300 p-3 rounded-lg outline-none focus:border-orange-500 font-bold" value={picStaff[mnf.id] || ''} onChange={e => setPicStaff({...picStaff, [mnf.id]: e.target.value})} />
              </div>
              <button onClick={() => dispatchManifest(mnf.id)} disabled={!isReadyToDispatch} className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 ${isReadyToDispatch ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-300 text-slate-500'}`}><Truck size={20} /> Berangkatkan Truk</button>
            </div>
          </div>
        )
      })}
    </div>
  );
}

// ==========================================
// 4. DRIVER VIEW
// ==========================================
function DriverView({ manifests, activeDriver, showToast, refreshData }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [catatanText, setCatatanText] = useState('');
  const [inputUangDiterima, setInputUangDiterima] = useState('');
  
  const [fotoResi, setFotoResi] = useState(null);
  const [fotoBarang, setFotoBarang] = useState(null);
  const [fotoBayar, setFotoBayar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const myManifests = manifests
    .filter(m => m.driver === activeDriver && (m.status === 'on_delivery' || m.status === 'loading'))
    .map(mnf => ({ ...mnf, items: mnf.items.filter(it => it.status !== 'issue' && it.status !== 'delivered' && it.status !== 'returned') }))
    .filter(mnf => mnf.items.length > 0);

  const processImageWatermark = async (e, setPhotoState) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    let lat = 0, lon = 0;
    let alamatSatelit = "Mencari alamat lokasi...";
    
    if (navigator.geolocation) {
       try {
         const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {timeout: 6000}));
         lat = pos.coords.latitude.toFixed(5);
         lon = pos.coords.longitude.toFixed(5);
         try {
           const satRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
           const data = await satRes.json();
           if(data && data.address) {
             const a = data.address;
             alamatSatelit = `${a.road||''} ${a.suburb||a.village||''} ${a.city_district||a.county||''} ${a.city||a.town||''}`.trim().replace(/\s+/g, ', ');
           }
         } catch(err) { alamatSatelit = "Nama jalan gagal dimuat"; }
       } catch(err) { alamatSatelit = "GPS Ditolak/Sinyal Lemah"; }
    } else { alamatSatelit = "GPS Tidak Didukung HP"; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, canvas.height - 130, canvas.width, 130);
        
        ctx.fillStyle = "white";
        ctx.font = "bold 22px sans-serif";
        const timeStr = new Date().toLocaleString('id-ID');
        ctx.fillText(`Waktu: ${timeStr}`, 15, canvas.height - 90);
        
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#67e8f9"; 
        ctx.fillText(`GPS: Lat ${lat}, Long ${lon}`, 15, canvas.height - 65);
        
        ctx.fillStyle = "#fef08a"; 
        ctx.font = "16px sans-serif";
        const safeAlamat = alamatSatelit.length > 55 ? alamatSatelit.substring(0, 55) + '...' : alamatSatelit;
        ctx.fillText(`Lokasi: ${safeAlamat}`, 15, canvas.height - 35);

        const logoImg = new Image();
        logoImg.crossOrigin = "Anonymous";
        logoImg.onload = () => {
          ctx.drawImage(logoImg, canvas.width - 110, canvas.height - 120, 100, 100);
          setPhotoState(canvas.toDataURL('image/jpeg', 0.6));
          setIsUploading(false);
        };
        logoImg.onerror = () => {
          setPhotoState(canvas.toDataURL('image/jpeg', 0.6));
          setIsUploading(false);
        };
        logoImg.src = LOGO_PERUSAHAAN_URL;
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const updateItemStatus = async (manifestId, itemId, newStatus) => {
    const isCOD = selectedItem.item.pembayaran.includes('COD');
    
    if (newStatus === 'delivered') {
      if (!fotoResi || !fotoBarang) {
        return alert("GAGAL! Anda WAJIB mengambil Foto Resi dan Foto Barang sebelum menyelesaikan tugas.");
      }
      if (isCOD && (!inputUangDiterima || !fotoBayar)) {
        return alert("GAGAL! Tugas COD WAJIB menyertakan Nominal Uang dan Foto Bukti Pembayaran (Uang/Transfer).");
      }
    }

    const updatePayload = {
      status: newStatus,
      foto_resi_url: fotoResi, 
      foto_barang_url: fotoBarang, 
      foto_bayar_url: fotoBayar, 
      nominal_diterima: isCOD ? Number(inputUangDiterima) : 0, 
      catatan: catatanText || (newStatus === 'delivered' ? 'Diterima dengan baik' : 'Retur/Gagal kirim') 
    };

    try {
      showToast("Mengunggah data & foto...", "success");
      await fetch(`${supabaseUrl}/items?id=eq.${itemId}`, { method: 'PATCH', headers, body: JSON.stringify(updatePayload) });
      
      const originalMnf = manifests.find(m => m.id === manifestId);
      const otherItems = originalMnf.items.filter(it => it.id !== itemId);
      const isLastItem = otherItems.every(it => ['delivered', 'returned', 'issue'].includes(it.status));
      
      if (isLastItem) {
        await fetch(`${supabaseUrl}/manifests?id=eq.${manifestId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'completed' }) });
      }

      setSelectedItem(null); setCatatanText(''); setInputUangDiterima(''); setFotoResi(null); setFotoBarang(null); setFotoBayar(null);
      refreshData();
      showToast("Laporan Selesai & Terkirim ke Admin Resi!");
    } catch (err) { alert("Gagal koneksi ke Cloud."); }
  };

  const getPaymentColor = (pembayaran) => {
    if (pembayaran === 'Lunas') return 'bg-green-50 text-green-700 border-green-200';
    if (pembayaran === 'Invoice') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-red-50 text-red-700 border-red-200';
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
           <p className="text-slate-500 font-medium text-lg">Semua tugas selesai. Data sudah ditarik Admin!</p>
         </div>
      )}

      {myManifests.map(mnf => (
        <div key={mnf.id} className="space-y-4 mb-8">
          <div className="bg-[#2596be] text-white p-4 rounded-xl shadow-md border-b-4 border-[#1e7a9c] flex justify-between items-center"><h3 className="font-bold tracking-wider">Muatan: {mnf.id}</h3><span className="bg-[#1e7a9c] text-xs px-2 py-1 rounded font-bold">Sisa {mnf.items.length} Resi</span></div>
          {mnf.items.map(it => (
            <div key={it.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-[#2596be]">
              <div className="flex justify-between items-start mb-3"><span className="font-black text-lg text-slate-800">{it.resi_manual}</span><ItemStatusBadge status={it.status} /></div>
              <div className="text-sm text-slate-600 mb-4 space-y-1.5"><p className="flex items-start gap-2"><User size={16} className="mt-0.5 text-slate-400"/> <span className="font-semibold text-slate-800">{it.penerima}</span></p><p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-slate-400"/> {it.alamat}</p><p className="flex items-start gap-2 font-bold text-[#2596be] mt-2"><Package size={16} className="mt-0.5"/> {it.koli} Koli | {it.berat} Kg</p></div>
              <div className={`mb-4 p-3 rounded-xl text-sm font-bold border ${getPaymentColor(it.pembayaran)}`}><div className="flex items-center gap-2">{it.pembayaran.includes('COD') ? <Wallet size={18}/> : <CheckCircle2 size={18}/>} Status: {it.pembayaran}</div>{it.nominalCOD > 0 && <div className="mt-1 text-lg font-black tracking-tight text-red-600">{formatRp(it.nominalCOD)}</div>}</div>
              <button onClick={() => setSelectedItem({ manifestId: mnf.id, item: it })} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-black transition"><Camera size={18} /> Ambil Bukti & Update</button>
            </div>
          ))}
        </div>
      ))}

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl my-auto border-t-8 border-[#2596be] mt-20">
            <h3 className="font-black text-xl mb-4 text-slate-800 border-b pb-3">Laporan: {selectedItem.item.resi_manual}</h3>
            
            {selectedItem.item.pembayaran.includes('COD') && (
              <div className="mb-5 bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2"><Wallet size={18}/> Wajib Tagih Pelanggan</h4><p className="text-3xl font-black text-red-600 mb-4">{formatRp(selectedItem.item.nominalCOD)}</p>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Uang / Transfer Diterima (Rp):</label><input type="number" className="w-full border-2 border-orange-300 p-3 rounded-xl text-xl font-black mb-4 focus:outline-none text-slate-800" placeholder="Cth: 1500000" value={inputUangDiterima} onChange={(e) => setInputUangDiterima(e.target.value)} />
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Foto Bukti Uang / Struk Transfer (Wajib):</label>
                <div className="border-2 border-dashed border-orange-400 rounded-xl p-1 text-center cursor-pointer hover:bg-orange-100 h-32 flex flex-col items-center justify-center relative bg-white overflow-hidden">
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => processImageWatermark(e, setFotoBayar)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {fotoBayar ? <img src={fotoBayar} className="w-full h-full object-cover rounded-lg" alt="Preview" /> : <><Banknote className="text-orange-500 w-8 h-8 mb-2" /><p className="text-xs text-orange-700 font-bold">Jepret Uang/Struk</p></>}
                </div>
              </div>
            )}
            
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Foto Fisik Resi & Barang (Wajib Ada)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-1 text-center cursor-pointer hover:bg-slate-50 h-32 flex flex-col items-center justify-center relative bg-slate-50 overflow-hidden">
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => processImageWatermark(e, setFotoResi)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {fotoResi ? <img src={fotoResi} className="w-full h-full object-cover rounded-lg" alt="Preview" /> : <><Camera className="text-slate-400 w-8 h-8 mb-2" /><p className="text-xs text-slate-600 font-bold">Jepret Resi</p></>}
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-1 text-center cursor-pointer hover:bg-slate-50 h-32 flex flex-col items-center justify-center relative bg-slate-50 overflow-hidden">
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => processImageWatermark(e, setFotoBarang)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {fotoBarang ? <img src={fotoBarang} className="w-full h-full object-cover rounded-lg" alt="Preview" /> : <><Box className="text-slate-400 w-8 h-8 mb-2" /><p className="text-xs text-slate-600 font-bold">Jepret Barang</p></>}
                </div>
              </div>
              {isUploading && <p className="text-xs text-[#2596be] font-bold mt-2 animate-pulse text-center bg-blue-50 py-2 rounded-lg border border-blue-200">Satelit sedang mencari lokasi Jalan Anda...</p>}
            </div>

            <div className="mb-6"><label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Catatan Tambahan</label><textarea className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:border-[#2596be] outline-none min-h-[80px]" placeholder="Ada pesan khusus?" value={catatanText} onChange={(e) => setCatatanText(e.target.value)} /></div>
            
            <div className="grid grid-cols-2 gap-3"><button onClick={() => updateItemStatus(selectedItem.manifestId, selectedItem.item.id, 'returned')} className="bg-red-50 text-red-700 hover:bg-red-100 font-bold py-3.5 rounded-xl border border-red-200 flex justify-center items-center gap-2 transition"><XCircle size={18}/> Retur</button><button onClick={() => updateItemStatus(selectedItem.manifestId, selectedItem.item.id, 'delivered')} className="bg-green-600 text-white hover:bg-green-700 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg transition"><CheckCircle2 size={18}/> Selesai</button></div>
            <button onClick={() => {setSelectedItem(null); setCatatanText(''); setInputUangDiterima(''); setFotoResi(null); setFotoBarang(null); setFotoBayar(null);}} className="w-full mt-4 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl font-bold py-3 transition">Batal / Kembali</button>
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
  const styles = { pending: 'bg-slate-100 text-slate-600', loaded: 'bg-yellow-100 text-yellow-700', delivered: 'bg-green-100 text-green-800', returned: 'bg-red-100 text-red-800', issue: 'bg-red-600 text-white', menunggu_jadwal: 'bg-purple-100 text-purple-700 border border-purple-200' };
  const labels = { pending: 'Di Gudang', loaded: 'Di Truk', delivered: 'Terkirim', returned: 'Retur', issue: 'Barang Kurang', menunggu_jadwal: 'Belum Masuk Truk' };
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider print:border print:border-black print:bg-transparent print:text-black ${styles[status]}`}>{labels[status]}</span>;
}
