import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useAuthStore } from '../stores/useAuthStore';
// Update the import path below if the file is located elsewhere or has a different name:
import { useAuthStore } from '../stores/useAuthStore'; // <-- Ensure this file exists at the correct path
// import { useMusicStore } from '@/stores/useMusicStore';
import { useMusicStore } from '../stores/useMusicStore';
import { Card } from '../components/ui/Card';
import { Music } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const SpotifyCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { setSpotifyConnected } = useMusicStore();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('Spotify bağlantısı kuruluyor...');

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Spotify bağlantısı reddedildi.');
          setTimeout(() => navigate('/music'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Spotify authorization code bulunamadı.');
          setTimeout(() => navigate('/music'), 3000);
          return;
        }

        // Send code to backend to exchange for tokens
        const response = await fetch('/api/music/spotify/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getSupabaseToken()}`,
          },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          const data = await response.json();
          setSpotifyConnected(true);
          setStatus('success');
          setMessage('Spotify başarıyla bağlandı! Müzik sayfasına yönlendiriliyorsunuz...');
          setTimeout(() => navigate('/music'), 2000);
        } else {
          throw new Error('Failed to connect Spotify');
        }
      } catch (error) {
        console.error('Spotify callback error:', error);
        setStatus('error');
        setMessage('Spotify bağlantısında bir hata oluştu.');
        setTimeout(() => navigate('/music'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setSpotifyConnected]);

  const getSupabaseToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          )}
          {status === 'success' && (
            <div className="text-green-500 mb-4">
              <Music size={64} className="mx-auto animate-pulse" />
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-500 mb-4">
              <Music size={64} className="mx-auto" />
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Spotify Bağlantısı
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </Card>
    </div>
  );
};
