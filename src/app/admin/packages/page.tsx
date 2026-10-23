'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

const emptyForm = {
  name: '',
  description: '',
  basePrice: '',
  imageUrl: '',
  category: 'SILVER',
  facilities: '',
};

export default function AdminPackagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const role = (session?.user as any)?.role;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/packages');
      return;
    }
    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
      return;
    }
    if (isAdmin) fetchPackages();
  }, [status, isAdmin, router]);

  async function fetchPackages() {
    const res = await fetch('/api/admin/packages');
    const data = await res.json();
    setPackages(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  }

  function openEdit(pkg: any) {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description,
      basePrice: pkg.basePrice.toString(),
      imageUrl: pkg.imageUrl,
      category: pkg.category,
      facilities: pkg.facilities.join('\n'),
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const facilitiesArr = form.facilities
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      name: form.name,
      description: form.description,
      basePrice: parseInt(form.basePrice),
      imageUrl: form.imageUrl,
      category: form.category,
      facilities: facilitiesArr,
    };

    const url = editing
      ? `/api/admin/packages/${editing.id}`
      : '/api/admin/packages';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || 'Gagal menyimpan');
      return;
    }

    setShowModal(false);
    fetchPackages();
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus paket ini?')) return;

    const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Gagal menghapus');
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-darkbg bg-radial-pink">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg bg-radial-pink">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">
              ⚡ Admin • Paket
            </div>
            <h1 className="font-serif text-4xl font-black text-white mb-2">
              Kelola <span className="text-gradient-pink italic">Paket Wedding</span>
            </h1>
            <p className="text-zinc-400">
              Tambah, edit, atau hapus paket wedding
            </p>
          </div>

          <button
            onClick={openAdd}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all whitespace-nowrap"
          >
            + Tambah Paket
          </button>
        </div>

        {/* Admin Menu */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-darkborder text-zinc-400 hover:bg-darkborder/70 text-xs font-bold whitespace-nowrap">
            📋 Booking
          </Link>
          <Link href="/admin/packages" className="px-4 py-2 rounded-xl bg-brand-500 text-black text-xs font-bold whitespace-nowrap">
            💎 Paket
          </Link>
        </div>

        {/* Grid Paket */}
        {packages.length === 0 ? (
          <div className="card-premium text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              Belum Ada Paket
            </h2>
            <p className="text-zinc-400 mb-6">
              Klik "Tambah Paket" untuk bikin paket wedding baru
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card-premium group overflow-hidden flex flex-col">
                <div className="relative aspect-video overflow-hidden rounded-xl mb-4 bg-zinc-900">
                  <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 text-xs font-bold text-black bg-gradient-to-r from-brand-500 to-gold-400 px-2 py-1 rounded">
                    {pkg.category}
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-2 flex-grow">{pkg.description}</p>

                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Harga</div>
                <div className="text-xl font-black text-gradient-gold mb-4">
                  {formatRupiah(pkg.basePrice)}
                </div>

                <div className="pt-4 border-t border-darkborder flex gap-2">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex-1 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-black font-bold text-xs border border-blue-500/30 transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="flex-1 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-black font-bold text-xs border border-rose-500/30 transition-all"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-dark rounded-3xl border border-darkborder w-full max-w-2xl p-8 relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-darkborder hover:bg-darkborder/70 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="font-serif text-2xl font-bold text-white mb-6">
              {editing ? 'Edit Paket' : 'Tambah Paket Baru'}
            </h2>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Nama Paket *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Paket Diamond"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Deskripsi *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Paket mewah untuk 1500 tamu..."
                  className="input resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Harga (Rp) *</label>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    required
                    placeholder="500000000"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Kategori *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                  >
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="DIAMOND">Diamond</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">URL Gambar *</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="input"
                />
              </div>

              <div>
                <label className="label">Fasilitas (1 per baris) *</label>
                <textarea
                  value={form.facilities}
                  onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                  required
                  rows={6}
                  placeholder={"Venue 1500 pax\nKatering 1500 porsi\nDekorasi super mewah\n..."}
                  className="input resize-none font-mono text-xs"
                />
                <div className="text-xs text-zinc-500 mt-1">
                  💡 Tulis fasilitas, satu per baris
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3.5 disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : editing ? 'Update Paket' : 'Simpan Paket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}