'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  CheckCircle, 
  XCircle, 
  Wifi, 
  WifiOff, 
  LogOut,
  History,
  Settings
} from 'lucide-react';
import { scannerService } from '@/lib/api/scanner';

interface ScanResult {
  id: string;
  timestamp: Date;
  ticketNumber?: string;
  result: 'success' | 'duplicate' | 'invalid' | 'expired' | 'cancelled';
  message: string;
  offline: boolean;
}

interface SessionData {
  accessToken: string;
  deviceId: string;
  deviceName: string;
  sessionId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  expiresAt: string;
}

export default function ScannerPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState({ success: 0, failed: 0, total: 0 });
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerInitialized = useRef(false);

  // Load session from localStorage
  useEffect(() => {
    const sessionData = localStorage.getItem('scanner_session');
    if (!sessionData) {
      router.push('/scanner');
      return;
    }
    
    try {
      const parsed = JSON.parse(sessionData);
      setSession(parsed);
    } catch (error) {
      console.error('Failed to parse session:', error);
      router.push('/scanner');
    }
  }, [router]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Define scan callbacks before useEffect
  const onScanSuccess = async (decodedText: string) => {
    if (!session) return;

    // Prevent duplicate scans within 2 seconds
    if (lastScan && Date.now() - lastScan.timestamp.getTime() < 2000) {
      return;
    }

    // Vibrate on scan
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    try {
      const response = await scannerService.verifyTicket(
        decodedText,
        session.accessToken,
        session.deviceId
      );

      const result: ScanResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ticketNumber: response.ticket?.ticketNumber,
        result: response.valid ? 'success' : 
                response.reason === 'ALREADY_CHECKED_IN' ? 'duplicate' :
                response.reason === 'TICKET_EXPIRED' ? 'expired' :
                response.reason?.includes('CANCELLED') ? 'cancelled' : 'invalid',
        message: response.message,
        offline: false
      };

      setLastScan(result);
      setScanHistory(prev => [result, ...prev].slice(0, 50));
      
      if (result.result === 'success') {
        setStats(prev => ({ ...prev, success: prev.success + 1, total: prev.total + 1 }));
        playSuccessSound();
      } else {
        setStats(prev => ({ ...prev, failed: prev.failed + 1, total: prev.total + 1 }));
        playErrorSound();
      }

      // Auto-clear after 3 seconds
      setTimeout(() => setLastScan(null), 3000);
    } catch (error) {
      console.error('Scan error:', error);
      const result: ScanResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        result: 'invalid',
        message: 'Failed to verify ticket',
        offline: !isOnline
      };
      setLastScan(result);
      setStats(prev => ({ ...prev, failed: prev.failed + 1, total: prev.total + 1 }));
      playErrorSound();
      setTimeout(() => setLastScan(null), 3000);
    }
  };

  const onScanFailure = (error: string) => {
    // Silent - scanning continuously
  };

  // Initialize QR scanner
  useEffect(() => {
    if (!session || scannerInitialized.current) return;

    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          onScanSuccess,
          onScanFailure
        );
        
        scannerInitialized.current = true;
        setScanning(true);
      } catch (error) {
        console.error('Scanner init error:', error);
        alert('Failed to start camera. Please allow camera access.');
      }
    };

    initScanner();

    return () => {
      if (html5QrCodeRef.current && scannerInitialized.current) {
        html5QrCodeRef.current.stop()
          .then(() => {
            scannerInitialized.current = false;
            html5QrCodeRef.current = null;
          })
          .catch((err) => {
            console.log('Scanner already stopped:', err);
            scannerInitialized.current = false;
            html5QrCodeRef.current = null;
          });
      }
    };
  }, [session, onScanSuccess, onScanFailure]);

  const playSuccessSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    audio.play().catch(() => {});
  };

  const playErrorSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    audio.play().catch(() => {});
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? You will need to rejoin the session.')) {
      localStorage.removeItem('scanner_session');
      if (html5QrCodeRef.current && scannerInitialized.current) {
        html5QrCodeRef.current.stop()
          .then(() => {
            scannerInitialized.current = false;
            html5QrCodeRef.current = null;
            router.push('/scanner');
          })
          .catch(() => {
            scannerInitialized.current = false;
            html5QrCodeRef.current = null;
            router.push('/scanner');
          });
      } else {
        router.push('/scanner');
      }
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{session.eventTitle}</h1>
            <p className="text-sm text-slate-400">{session.deviceName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{stats.success}</div>
            <div className="text-xs text-slate-400">Success</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
            <div className="text-xs text-slate-400">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
        </div>
      </div>

      {/* Scanner View */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* QR Scanner */}
        <div className="relative w-full max-w-[780px]">
          <div 
            id="qr-reader" 
            className="rounded-lg overflow-hidden border-4 border-brand-500"
            style={{ minHeight: '400px'}}
          ></div>
          
          {/* Scan Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brand-400"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brand-400"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brand-400"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brand-400"></div>
          </div>
        </div>

        <p className="text-sm text-slate-400 mt-4 text-center">
          Point camera at QR code to scan
        </p>

        {/* Last Scan Result */}
        {lastScan && (
          <div className={`mt-6 w-full max-w-md p-4 rounded-lg border-2 ${
            lastScan.result === 'success' 
              ? 'bg-green-900/50 border-green-500' 
              : 'bg-red-900/50 border-red-500'
          }`}>
            <div className="flex items-center gap-3">
              {lastScan.result === 'success' ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div className="flex-1">
                <p className="font-semibold">
                  {lastScan.result === 'success' ? 'Valid Ticket' : 'Invalid Ticket'}
                </p>
                <p className="text-sm opacity-90">{lastScan.message}</p>
                {lastScan.ticketNumber && (
                  <p className="text-xs opacity-75 mt-1">{lastScan.ticketNumber}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 w-80 bg-slate-800 border-l border-slate-700 shadow-2xl overflow-y-auto z-50">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold">Scan History</h2>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
          <div className="p-4 space-y-2">
            {scanHistory.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No scans yet</p>
            ) : (
              scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className={`p-3 rounded-lg border ${
                    scan.result === 'success'
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-red-900/20 border-red-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {scan.result === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{scan.message}</p>
                      {scan.ticketNumber && (
                        <p className="text-xs text-slate-400">{scan.ticketNumber}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {scan.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
