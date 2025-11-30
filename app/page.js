import React, { useState } from 'react';
import { Search, TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react';
export default function TradeVolumeChecker() {
const [walletAddress, setWalletAddress] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [userData, setUserData] = useState(null);
const fetchUserVolume = async () => {
if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
setError('Veuillez entrer une adresse wallet valide (format: 0x...)');
return;
}
setLoading(true);
setError('');
setUserData(null);

try {
  const response = await fetch('/api/hyperliquid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'clearinghouseState',
      user: walletAddress,
    }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des données');
  }

  const data = await response.json();

  if (!data || (!data.marginSummary && !data.assetPositions)) {
    setError('Aucune donnée trouvée pour cette adresse');
    setLoading(false);
    return;
  }

  const fillsResponse = await fetch('/api/hyperliquid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'userFills',
      user: walletAddress,
    }),
  });

  let totalVolume = 0;
  let tradesCount = 0;

  if (fillsResponse.ok) {
    const fillsData = await fillsResponse.json();
    
    if (Array.isArray(fillsData)) {
      tradesCount = fillsData.length;
      totalVolume = fillsData.reduce((sum, fill) => {
        const volume = parseFloat(fill.px) * parseFloat(fill.sz);
        return sum + volume;
      }, 0);
    }
  }

  setUserData({
    address: walletAddress,
    accountValue: data.marginSummary?.accountValue || '0',
    withdrawable: data.withdrawable || '0',
    totalVolume: totalVolume.toFixed(2),
    tradesCount: tradesCount,
    crossMarginSummary: data.crossMarginSummary,
    assetPositions: data.assetPositions || [],
  });
} catch (err) {
  setError(err.message || 'Une erreur est survenue');
} finally {
  setLoading(false);
}
};
const handleKeyPress = (e) => {
if (e.key === 'Enter') {
fetchUserVolume();
}
};
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
<div className="max-w-4xl mx-auto">
<div className="text-center mb-8">
<h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
<TrendingUp className="w-10 h-10 text-purple-400" />
Trade.xyz Volume Checker
</h1>
<p className="text-slate-300 text-lg">
Vérifiez le volume de trading et les statistiques d'une adresse wallet
</p>
</div>
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 shadow-2xl">
      <div className="space-y-4">
        <div>
          <label htmlFor="wallet" className="block text-sm font-medium text-white mb-2">
            Adresse Wallet
          </label>
          <div className="flex gap-3">
            <input
              id="wallet"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="0x..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={fetchUserVolume}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Rechercher
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}
    </div>

    {userData && (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-white" />
              <h3 className="text-white/80 text-sm font-medium">Volume Total</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              ${parseFloat(userData.totalVolume).toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-white" />
              <h3 className="text-white/80 text-sm font-medium">Nombre de Trades</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {userData.tradesCount.toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-white" />
              <h3 className="text-white/80 text-sm font-medium">Valeur du Compte</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              ${parseFloat(userData.accountValue).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Détails du Compte</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-300">Adresse</span>
              <span className="text-white font-mono text-sm">
                {userData.address.slice(0, 6)}...{userData.address.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-300">Montant Retirable</span>
              <span className="text-white font-semibold">
                ${parseFloat(userData.withdrawable).toLocaleString()}
              </span>
            </div>
            {userData.crossMarginSummary && (
              <>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-300">Total Raw USD</span>
                  <span className="text-white font-semibold">
                    ${parseFloat(userData.crossMarginSummary.totalRawUsd || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-300">Total PnL Non Réalisé</span>
                  <span className={`font-semibold ${
                    parseFloat(userData.crossMarginSummary.totalNtlPos || 0) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    ${parseFloat(userData.crossMarginSummary.totalNtlPos || 0).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {userData.assetPositions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Positions Actives</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Asset</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">Position</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.assetPositions.map((pos, idx) => (
                    <tr key={idx} className="border-b border-white/10">
                      <td className="py-3 px-4 text-white font-medium">
                        {pos.position?.coin || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-white text-right">
                        {pos.position?.szi || '0'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        parseFloat(pos.position?.unrealizedPnl || 0) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        ${parseFloat(pos.position?.unrealizedPnl || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

    <div className="mt-8 text-center text-slate-400 text-sm">
      <p>Données fournies par l'API Hyperliquid • Trade.xyz utilise Hyperliquid</p>
    </div>
  </div>
</div>
);
}

