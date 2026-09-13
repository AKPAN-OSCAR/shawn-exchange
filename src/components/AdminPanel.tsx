import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  ArrowUpRight,
  TrendingUp,
  Settings,
  ShieldCheck,
  User,
  History,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, limit, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';
import { TRANSACTION_STATUS, SETTLEMENT_ACCOUNT } from '../constants';

export const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'rates' | 'users'>('transactions');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const newTxs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Notify on new transactions (excluding initial load)
      if (transactions.length > 0 && newTxs.length > transactions.length) {
        const latest = newTxs[0];
        setNotification({
          message: `New trade initiated by @${latest.username}`,
          detail: `${latest.assetName} - ${formatCurrency(latest.nairaAmount)}`,
          id: latest.id
        });
        // Clear after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
      
      setTransactions(newTxs);
    });

    const ratesUnsub = onSnapshot(collection(db, 'rates'), (snapshot) => {
      setRates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsub(); ratesUnsub(); usersUnsub(); };
  }, []);

  const handleStatusChange = async (tx: any, newStatus: string) => {
    setLoading(true);
    try {
      const txRef = doc(db, 'transactions', tx.id);
      await updateDoc(txRef, { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Business logic on PAID
      if (newStatus === TRANSACTION_STATUS.PAID) {
        const userRef = doc(db, 'users', tx.userId);
        
        if (tx.type === 'deposit') {
          // Increment wallet balance for deposits
          await setDoc(userRef, {
            walletBalance: increment(tx.nairaAmount),
            updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          // Increment trade volume for buys/sells
          await setDoc(userRef, {
            totalTradeVolume: increment(tx.nairaAmount),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      }
      setSelectedTx(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const pendingTotal = transactions
    .filter(t => t.status === TRANSACTION_STATUS.PENDING || t.status === TRANSACTION_STATUS.AWAITING_PAYMENT)
    .reduce((acc, t) => acc + t.nairaAmount, 0);

  const processingTotal = transactions
    .filter(t => t.status === TRANSACTION_STATUS.PROCESSING)
    .reduce((acc, t) => acc + t.nairaAmount, 0);

  const updateRate = async (id: string, field: 'buyRate' | 'sellRate', newValue: number) => {
    try {
      await updateDoc(doc(db, 'rates', id), { [field]: newValue });
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyUser = async (userId: string, status: boolean) => {
    try {
      await setDoc(doc(db, 'users', userId), { 
        verified: status,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col pt-4 relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-6 right-6 z-[110] bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 cursor-pointer"
            onClick={() => {
              const tx = transactions.find(t => t.id === notification.id);
              if (tx) setSelectedTx(tx);
              setNotification(null);
            }}
          >
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">New Activity</p>
              <h4 className="text-xs font-bold leading-tight">{notification.message}</h4>
              <p className="text-[9px] text-accent font-bold">{notification.detail}</p>
            </div>
            <ChevronRight size={16} className="text-white/20" />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-primary">
            <ChevronLeft />
          </button>
          <h1 className="text-2xl font-display font-bold">Admin Console</h1>
        </div>
        <div className="bg-primary/5 p-2 rounded-2xl flex gap-1">
          {['transactions', 'rates', 'users'].map((t: any) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === t ? "bg-white text-primary shadow-sm" : "text-primary/40 hover:text-primary"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'transactions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Settlement Summary */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-[#003D29] p-4 rounded-2xl text-white shadow-sm">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Pending</p>
                  <p className="text-xl font-display font-bold">{formatCurrency(pendingTotal)}</p>
                </div>
                <div className="bg-accent p-4 rounded-2xl text-white shadow-sm">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">In Processing</p>
                  <p className="text-xl font-display font-bold">{formatCurrency(processingTotal)}</p>
                </div>
              </div>

              <div className="bg-white border border-black/5 rounded-3xl p-4 flex items-center gap-3">
                <Search size={18} className="text-primary/20" />
                <input placeholder="Search transaction ID, user..." className="flex-1 bg-transparent text-sm outline-none" />
                <Filter size={18} className="text-primary/40 cursor-pointer" />
              </div>

              <div className="space-y-3">
                {transactions.map((tx) => (
                  <button 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="w-full card-premium flex items-center justify-between hover:border-accent/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-xl",
                        tx.type === 'deposit' ? "bg-blue-50 text-blue-600" :
                        tx.status === TRANSACTION_STATUS.PAID ? "bg-green-50 text-green-600" :
                        tx.status === TRANSACTION_STATUS.FAILED ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {tx.type === 'deposit' ? "💳" : tx.type.includes('crypto') ? "💰" : "🎁"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          {tx.assetName || "Wallet Deposit"}
                          <span className={cn(
                            "text-[8px] px-1.5 py-0.5 rounded-full border shadow-sm",
                            tx.type.includes('buy') ? "text-purple-600 bg-purple-50 border-purple-100" :
                            tx.type.includes('sell') ? "text-amber-600 bg-amber-50 border-amber-100" : "text-blue-600 bg-blue-50 border-blue-100"
                          )}>
                            {tx.type.split('_').pop()?.toUpperCase()}
                          </span>
                        </h4>
                        <p className="text-[10px] text-primary/40 font-medium">@{tx.username} • {new Date(tx.createdAt?.seconds * 1000).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(tx.nairaAmount)}</p>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-widest",
                        tx.status === TRANSACTION_STATUS.PAID ? "text-green-500" : "text-orange-500"
                      )}>{tx.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'rates' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rates.map((rate) => (
                <div key={rate.id} className="card-premium">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-accent">
                        <TrendingUp size={20} />
                      </div>
                      <h4 className="font-bold">{rate.assetName}</h4>
                    </div>
                    <span className="text-[10px] bg-secondary px-2 py-1 rounded-lg font-bold uppercase text-primary/40 tracking-widest">{rate.category}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-black/5">
                      <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest leading-none">I Buy @</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-display font-bold">₦{rate.buyRate}</span>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => updateRate(rate.id, 'buyRate', rate.buyRate + 5)} className="text-accent hover:bg-accent/10 p-0.5 rounded">+</button>
                          <button onClick={() => updateRate(rate.id, 'buyRate', rate.buyRate - 5)} className="text-accent hover:bg-accent/10 p-0.5 rounded">-</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-xl border border-black/5">
                      <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest leading-none">I Sell @</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-display font-bold">₦{rate.sellRate || 0}</span>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => updateRate(rate.id, 'sellRate', (rate.sellRate || 0) + 5)} className="text-accent hover:bg-accent/10 p-0.5 rounded">+</button>
                          <button onClick={() => updateRate(rate.id, 'sellRate', (rate.sellRate || 0) - 5)} className="text-accent hover:bg-accent/10 p-0.5 rounded">-</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-20">
              {users.map((u) => (
                <div key={u.id} className="card-premium flex items-center justify-between group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary/40 relative flex-shrink-0">
                      <User />
                      {u.verified ? (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                          <CheckCircle2 size={10} className="text-white" />
                        </div>
                      ) : (
                        <div className="absolute -top-1 -right-1 bg-gray-300 rounded-full p-0.5 border-2 border-white">
                          <XCircle size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-sm truncate">@{u.username}</h4>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full border shadow-sm font-bold uppercase",
                          u.verified ? "text-green-600 bg-green-50 border-green-100" : "text-gray-500 bg-gray-50 border-gray-100"
                        )}>
                          {u.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-primary/40 font-medium truncate mb-1">{u.email || 'No email provided'}</p>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-[8px] text-primary/40 uppercase font-bold tracking-widest">Trade Volume</p>
                          <p className="text-[10px] font-bold text-accent">{formatCurrency(u.totalTradeVolume || 0)}</p>
                        </div>
                        <div className="w-px h-6 bg-black/5" />
                        <div>
                          <p className="text-[8px] text-primary/40 uppercase font-bold tracking-widest">Wallet</p>
                          <p className="text-[10px] font-bold text-primary">{formatCurrency(u.walletBalance || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleVerifyUser(u.id, !u.verified)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                        u.verified 
                          ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                          : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                      )}
                    >
                      {u.verified ? 'Unverify' : 'Verify'}
                    </button>
                    {u.email && (
                      <button 
                        onClick={() => copyToClipboard(u.email)}
                        className="p-2 bg-secondary text-primary/40 hover:text-accent rounded-xl transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              className="relative w-full max-w-[400px] bg-white rounded-t-[40px] md:rounded-[40px] p-8 shadow-2xl flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Verification Panel</h2>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  selectedTx.status === TRANSACTION_STATUS.PAID ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                )}>
                  {selectedTx.status}
                </div>
              </div>

              <div className="space-y-4">
                {selectedTx.status === TRANSACTION_STATUS.AWAITING_PAYMENT || selectedTx.status === TRANSACTION_STATUS.PENDING ? (
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-2">
                    <button 
                      onClick={() => handleStatusChange(selectedTx, TRANSACTION_STATUS.PROCESSING)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-orange-200 rounded-xl text-orange-600 text-xs font-bold uppercase tracking-widest shadow-sm"
                    >
                      <Clock size={14} /> Start Processing
                    </button>
                  </div>
                ) : null}

                {/* Conditional Destination/Source UI */}
                {selectedTx.type.includes('sell') ? (
                  <div className="p-5 bg-secondary rounded-[32px] border border-black/5">
                    <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mb-1">Payout Destination (Trader's Bank)</p>
                    <p className="text-sm font-bold text-primary">{selectedTx.payoutAccount?.accountName}</p>
                    <p className="text-xs text-primary/60">{selectedTx.payoutAccount?.bankName} • {selectedTx.payoutAccount?.accountNumber}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => copyToClipboard(selectedTx.payoutAccount?.accountNumber)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-xl text-[9px] text-accent font-bold uppercase tracking-widest shadow-sm border border-black/5">
                        <Copy size={12} /> Account
                      </button>
                      <button onClick={() => copyToClipboard(selectedTx.payoutAccount?.accountName)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-xl text-[9px] text-accent font-bold uppercase tracking-widest shadow-sm border border-black/5">
                        <Copy size={12} /> Name
                      </button>
                    </div>
                  </div>
                ) : selectedTx.type.includes('buy') ? (
                  <div className="p-5 bg-secondary rounded-[32px] border border-black/5">
                    <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mb-1">Delivery Destination</p>
                    <p className="text-sm font-bold text-primary truncate">{selectedTx.destinationAddress || selectedTx.deliveryEmail}</p>
                    <p className="text-[10px] text-primary/60 mt-1 uppercase font-bold tracking-wider">Method: {selectedTx.paymentMethod || 'Transfer'}</p>
                    <button onClick={() => copyToClipboard(selectedTx.destinationAddress || selectedTx.deliveryEmail)} className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-xl text-[9px] text-accent font-bold uppercase tracking-widest shadow-sm border border-black/5">
                      <Copy size={12} /> Copy Address/Email
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-blue-50 rounded-[32px] border border-blue-100">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 text-center">Wallet Deposit Request</p>
                    <p className="text-xs text-blue-800 text-center font-medium">Verify that the user sent ₦{selectedTx.nairaAmount.toLocaleString()} to the settlement account.</p>
                  </div>
                )}

                <div className="p-5 bg-[#003D29] text-white rounded-[32px] shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                        {selectedTx.type === 'deposit' ? 'Processing Funding' : 'Admin Settlement'}
                      </p>
                      <h4 className="text-lg font-bold">
                        {selectedTx.type === 'deposit' ? 'Deposit Amount' : 
                         selectedTx.type.includes('buy') ? 'Order Cost' : 'Payout Amount'}
                      </h4>
                    </div>
                    <ShieldCheck className="text-accent" />
                  </div>
                  <h1 className="text-3xl font-display font-bold tracking-tight mb-2">{formatCurrency(selectedTx.nairaAmount)}</h1>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">
                      {selectedTx.type.includes('sell') ? 'Source Account (Admin)' : 'Recipient Account (Admin)'}
                    </p>
                    <p className="text-[11px] font-bold">{SETTLEMENT_ACCOUNT.accountName}</p>
                    <p className="text-[10px] text-white/60">{SETTLEMENT_ACCOUNT.bankName} • {SETTLEMENT_ACCOUNT.accountNumber}</p>
                  </div>
                  <p className="mt-4 text-white/30 text-[9px] leading-relaxed italic border-l-2 border-accent/30 pl-3">
                    Verify that Naira has been successfully transferred from this account before confirming payout status below.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {selectedTx.status !== TRANSACTION_STATUS.PAID && selectedTx.status !== TRANSACTION_STATUS.FAILED ? (
                  <>
                    <button 
                      disabled={loading}
                      onClick={() => handleStatusChange(selectedTx, TRANSACTION_STATUS.PAID)}
                      className="bg-primary text-white py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Confirm Paid
                    </button>
                    <button 
                      disabled={loading}
                      onClick={() => handleStatusChange(selectedTx, TRANSACTION_STATUS.FAILED)}
                      className="bg-red-50 text-red-600 py-5 rounded-2xl font-bold border border-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setSelectedTx(null)}
                    className="col-span-2 py-5 bg-secondary rounded-2xl font-bold text-primary/40"
                  >
                    Close Panel
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
