import React, { useEffect, useState } from 'react';
import { 
  Home, 
  ArrowUpRight, 
  Repeat, 
  User, 
  LayoutGrid,
  Bell,
  Eye,
  EyeOff,
  Plus,
  MessageCircle,
  TrendingUp,
  CreditCard,
  Gift,
  ArrowRight,
  ShieldCheck,
  Power,
  Settings,
  ArrowDownLeft,
  Clock,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { CryptoTrade } from './CryptoTrade';
import { GiftCardTrade } from './GiftCardTrade';
import { AdminPanel } from './AdminPanel';
import { BankAccounts } from './BankAccounts';
import { Deposit } from './Deposit';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { setDoc, doc, getDoc, collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '../constants';

export const Dashboard: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [view, setView] = useState<'main' | 'crypto' | 'giftcard' | 'admin' | 'banks' | 'history' | 'deposit'>('main');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [usdtRate, setUsdtRate] = useState<any>(null);

  useEffect(() => {
    if (isAdmin && view === 'main') {
      setView('admin');
    }
  }, [isAdmin]);

  useEffect(() => {
    // Seed initial rates if they don't exist
    const seedRates = async () => {
      if (!isAdmin) return;
      try {
        const initialRates = [
          { id: 'usdt', assetName: 'USDT (TRC20)', buyRate: 1650, sellRate: 1700, category: 'crypto', network: 'TRC20' },
          { id: 'razergold', assetName: 'Razer Gold', buyRate: 1400, sellRate: 1500, category: 'giftcard' },
          { id: 'itunes', assetName: 'iTunes/Apple', buyRate: 1250, sellRate: 1350, category: 'giftcard' },
          { id: 'steam', assetName: 'Steam', buyRate: 1300, sellRate: 1400, category: 'giftcard' },
          { id: 'googleplay', assetName: 'Google Play', buyRate: 1150, sellRate: 1250, category: 'giftcard' }
        ];

        for (const rate of initialRates) {
          const rateDoc = await getDoc(doc(db, 'rates', rate.id));
          if (!rateDoc.exists()) {
            await setDoc(doc(db, 'rates', rate.id), rate);
          }
        }
      } catch (err) {
        console.error("Rate seeding blocked by permissions", err);
      }
    };
    seedRates();

    // Listen for conversion rates
    const unsubRates = onSnapshot(doc(db, 'rates', 'usdt'), (snapshot) => {
      if (snapshot.exists()) setUsdtRate(snapshot.data());
    }, (err) => console.error("Rates fetch error:", err));

    return () => unsubRates();
  }, [isAdmin]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubTxs = onSnapshot(q, (snapshot) => {
      setRecentTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Recent transactions sync error:", err));
    return () => unsubTxs();
  }, [user]);

  if (view === 'crypto') return <CryptoTrade onBack={() => setView('main')} />;
  if (view === 'giftcard') return <GiftCardTrade onBack={() => setView('main')} />;
  if (view === 'admin') return <AdminPanel onBack={() => setView('main')} />;
  if (view === 'banks') return <BankAccounts onBack={() => setView('main')} />;
  if (view === 'deposit') return <Deposit onBack={() => setView('main')} onSuccess={() => setView('main')} />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background-surround p-0 md:p-4">
      <div className="w-full max-w-[390px] h-[844px] bg-secondary md:rounded-[40px] md:border-[8px] md:border-white shadow-2xl relative flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-secondary/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-[#1A1A1A] leading-tight">{profile?.username || 'Trader'}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="bg-accent/10 text-accent text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                TIER {profile?.tier || 1} VERIFIED
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setView('admin')}
                  className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                >
                  ADMIN
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary relative bg-white shadow-sm border border-black/5">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-primary/40 hover:text-primary transition-colors bg-white shadow-sm border border-black/5"
            >
              <Power size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide px-5">
          <div className="space-y-4 pt-2">
            {/* Wallet Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#003D29] to-[#026C4A] rounded-[28px] p-7 text-white shadow-[0_12px_24px_rgba(0,61,41,0.25)] relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Available Balance</p>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                  <ShieldCheck size={16} className="text-accent/40" />
                </div>
                <div className="flex items-center justify-between items-end mb-5">
                  <h1 className="text-3xl font-display font-bold tracking-tight">
                    {showBalance ? formatCurrency(profile?.walletBalance || 0) : '₦ • • • • •'}
                  </h1>
                  <button 
                    onClick={() => setView('deposit')}
                    className="bg-accent text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Plus size={14} strokeWidth={3} /> Fund
                  </button>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Total Trade Volume</p>
                    <p className="text-sm font-bold">{formatCurrency(profile?.totalTradeVolume || 0)}</p>
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                    <History size={16} />
                  </button>
                </div>
              </div>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-[60px]"></div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Buy USDT</p>
                  <p className="text-sm font-bold text-primary">₦{usdtRate?.sellRate || '---'}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Sell USDT</p>
                  <p className="text-sm font-bold text-primary">₦{usdtRate?.buyRate || '---'}</p>
                </div>
              </div>
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {[
                { icon: TrendingUp, label: 'Buy Crypto', color: '#E6F0ED', iconColor: '#003D29', action: () => setView('crypto') },
                { icon: Gift, label: 'Buy Cards', color: '#FFF4ED', iconColor: '#F2994A', action: () => setView('giftcard') },
                { icon: CreditCard, label: 'Banks', color: '#EDF4FF', iconColor: '#2F80ED', action: () => setView('banks') },
                { icon: History, label: 'History', color: '#F7F7F7', iconColor: '#828282', action: () => {} }
              ].map((item, i) => (
                <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 group">
                  <div className="w-16 h-16 rounded-[22px] flex items-center justify-center shadow-sm border border-black/[0.03] transition-all group-active:scale-95 group-hover:-translate-y-1" style={{ backgroundColor: item.color, color: item.iconColor }}>
                    <item.icon size={26} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-primary/80 uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="pt-4 pb-20">
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="text-sm font-bold text-[#1A1A1A]">Recent Activity</h3>
                <button className="text-[11px] text-accent font-bold px-3 py-1 bg-accent/5 rounded-lg">See All</button>
              </div>
              
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="bg-white border border-black/5 rounded-[22px] p-4 flex items-center justify-between shadow-sm hover:border-accent/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center text-xl",
                        tx.type.includes('crypto') ? "bg-green-50" : "bg-orange-50"
                      )}>
                        {tx.type.includes('crypto') ? "💰" : "🎁"}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-[#1A1A1A]">{tx.assetName}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-[#666666]">{tx.status.toUpperCase()}</p>
                          <div className="w-1 h-1 bg-[#BDBDBD] rounded-full"></div>
                          <p className="text-[10px] text-[#666666]">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-[#1A1A1A]">{formatCurrency(tx.nairaAmount)}</p>
                      <p className={cn(
                        "text-[9px] font-bold tracking-wider uppercase flex items-center justify-end gap-1",
                        tx.status === TRANSACTION_STATUS.PAID ? 'text-green-500' : 
                        tx.status === TRANSACTION_STATUS.FAILED ? 'text-red-500' : 'text-orange-500'
                      )}>
                        {tx.status === TRANSACTION_STATUS.PENDING && <Clock size={8} />}
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}

                {recentTransactions.length === 0 && (
                  <div className="text-center py-12 bg-white/50 border border-dashed border-black/5 rounded-[28px]">
                    <Clock className="mx-auto mb-3 opacity-20" size={32} />
                    <p className="text-[11px] font-bold text-primary/30 uppercase tracking-widest">No activities yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <a 
          href="https://wa.me/2349057655018"
          className="absolute bottom-[100px] right-6 w-15 h-15 bg-[#25D366] rounded-full shadow-[0_12px_28px_rgba(37,211,102,0.4)] flex items-center justify-center text-white z-30 transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle size={30} fill="currentColor" />
        </a>

        {/* Bottom Nav */}
        <nav className="absolute bottom-0 left-0 right-0 h-22 bg-white/80 backdrop-blur-xl border-t border-black/5 flex justify-around items-center pb-6 px-4 z-50">
          {[
            { icon: Home, label: 'Home', active: view === 'main', action: () => setView('main') },
            { icon: Repeat, label: 'Sell', active: view === 'crypto' || view === 'giftcard', action: () => setView('crypto') },
            { icon: CreditCard, label: 'Banks', active: view === 'banks', action: () => setView('banks') },
            { icon: User, label: 'Me', active: false, action: () => {} }
          ].map((tab, i) => (
            <button key={i} onClick={tab.action} className={cn(
              "flex flex-col items-center gap-1.5 transition-all outline-none", 
              tab.active ? "text-primary scale-110" : "text-[#BDBDBD] hover:text-primary/40"
            )}>
              <tab.icon size={22} strokeWidth={tab.active ? 2.8 : 2} />
              <span className="text-[9px] font-extrabold uppercase tracking-tight">{tab.label}</span>
              {tab.active && <motion.div layoutId="activeTab" className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

