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

const formatDate = (d: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(d));

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CONFIRMED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CANCELLED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const role = (session?.user as any)?.role;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    if (status === 'authenticated') {
      if (!isAdmin) {
        router.push('/');
        return;
      }

      fetch('/api/admin/bookings')
        .then((res) => res.json())
        .then((data) => {
          setBookings(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, isAdmin, router]);

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
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

  const filtered = filter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    revenue: bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.totalPrice, 0),
  };

  return (
    <div className="min-h-screen bg-darkbg bg-radial-pink">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">
            ⚡ Admin Dashboard
          </div>
          <h1 className="font-serif text-4xl font-black text-white mb-2">
            Kelola <span className="text-gradient-pink italic">Booking</span>
          </h1>
          <p className="text-zinc-400">
            Approve atau reject booking dari user
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-premium">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Booking</div>
            <div className="text-3xl font-black text-white">{stats.total}</div>
          </div>
          <div className="card-premium">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Pending</div>
            <div className="text-3xl font-black text-amber-400">{stats.pending}</div>
          </div>
          <div className="card-premium">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Confirmed</div>
            <div className="text-3xl font-black text-emerald-400">{stats.confirmed}</div>
          </div>
          <div className="card-premium">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Revenue</div>
            <div className="text-xl font-black text-gradient-gold">{formatRupiah(stats.revenue)}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-brand-500 text-black'
                  : 'bg-darkborder text-zinc-400 hover:bg-darkborder/70'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="card-premium text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              Tidak Ada Booking
            </h2>
            <p className="text-zinc-400">
              Belum ada booking dengan filter "{filter}"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div key={booking.id} className="card-premium">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                      <span className="text-xs font-mono text-zinc-500">
                        #{booking.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-white font-bold">
                      {booking.groomName} & {booking.brideName}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      👤 {booking.user?.name} • {booking.user?.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Total</div>
                    <div className="text-lg font-black text-gradient-gold">
                      {formatRupiah(booking.totalPrice)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-darkborder text-sm">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tanggal</div>
                    <div className="text-white font-semibold">{formatDate(booking.weddingDate)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">DP (30%)</div>
                    <div className="text-brand-500 font-bold">{formatRupiah(booking.dpAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Sisa</div>
                    <div className="text-white font-semibold">{formatRupiah(booking.remaining)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">WA</div>
                    <div className="text-white font-semibold">{booking.phone}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-zinc-500">
                  📍 {booking.venueAddress}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold text-xs border border-emerald-500/30 transition-all"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, 'CANCELLED')}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-black font-bold text-xs border border-rose-500/30 transition-all"
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateStatus(booking.id, 'IN_PROGRESS')}
                      className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-black font-bold text-xs border border-blue-500/30 transition-all"
                    >
                      🚀 Mulai Proses
                    </button>
                  )}

                  {booking.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateStatus(booking.id, 'COMPLETED')}
                      className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-black font-bold text-xs border border-purple-500/30 transition-all"
                    >
                      ✅ Selesai
                    </button>
                  )}

                  <div className="flex-grow"></div>

                  <Link
                    href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black font-bold text-xs border border-green-500/30 transition-all"
                  >
                    💬 Chat WhatsApp
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}