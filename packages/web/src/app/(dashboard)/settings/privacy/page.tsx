'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Download, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ConsentStatus {
  lgpd_consent_at: string | null;
  lgpd_consent_version: string | null;
  training_opt_in: boolean;
  has_consent: boolean;
}

export default function PrivacySettingsPage() {
  const [consent, setConsent] = useState<ConsentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? '';
  }, [supabase]);

  const fetchConsent = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/users/me/consent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setConsent(json.data);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar status de privacidade.' });
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchConsent();
  }, [fetchConsent]);

  const handleRevokeConsent = async () => {
    if (!confirm('Ao revogar o consentimento, voce nao podera processar imagens. Deseja continuar?')) return;

    setActionLoading('revoke');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/users/me/consent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setConsent(json.data);
      setMessage({ type: 'success', text: 'Consentimento revogado com sucesso.' });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao revogar consentimento.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantConsent = async () => {
    setActionLoading('grant');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/users/me/consent`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent_version: '1.0' }),
      });
      const json = await res.json();
      setConsent(json.data);
      setMessage({ type: 'success', text: 'Consentimento concedido com sucesso.' });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao conceder consentimento.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleTraining = async () => {
    const newValue = !consent?.training_opt_in;
    setActionLoading('training');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/users/me/training-opt-in`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ training_opt_in: newValue }),
      });
      const json = await res.json();
      setConsent(json.data);
      setMessage({
        type: 'success',
        text: newValue
          ? 'Uso de imagens para melhoria do modelo ativado.'
          : 'Uso de imagens para melhoria do modelo desativado.',
      });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao atualizar preferencia.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDataExport = async () => {
    setActionLoading('export');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/users/me/data-export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decorai-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Dados exportados com sucesso.' });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao exportar dados.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta acao nao pode ser desfeita. Seus dados serao removidos em ate 30 dias.')) return;
    if (!confirm('Confirme novamente: Deseja realmente excluir sua conta e todos os seus dados?')) return;

    setActionLoading('delete');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await supabase.auth.signOut();
        window.location.href = '/login';
      } else {
        setMessage({ type: 'error', text: 'Erro ao excluir conta.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao excluir conta.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Privacidade</h1>
        <p className="mt-2 text-sm text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Privacidade</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie suas preferencias de privacidade e dados pessoais conforme a LGPD.
        </p>
      </div>

      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Consent Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-gray-900">Consentimento LGPD</h2>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`text-sm font-medium ${consent?.has_consent ? 'text-green-600' : 'text-red-600'}`}>
              {consent?.has_consent ? 'Concedido' : 'Nao concedido'}
            </span>
          </div>
          {consent?.lgpd_consent_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data do consentimento</span>
              <span className="text-sm text-gray-900">
                {new Date(consent.lgpd_consent_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          {consent?.lgpd_consent_version && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Versao</span>
              <span className="text-sm text-gray-900">v{consent.lgpd_consent_version}</span>
            </div>
          )}
          <div className="mt-4">
            {consent?.has_consent ? (
              <button
                onClick={handleRevokeConsent}
                disabled={actionLoading === 'revoke'}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {actionLoading === 'revoke' ? 'Revogando...' : 'Revogar consentimento'}
              </button>
            ) : (
              <button
                onClick={handleGrantConsent}
                disabled={actionLoading === 'grant'}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {actionLoading === 'grant' ? 'Concedendo...' : 'Conceder consentimento'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Training Opt-In */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Melhoria do modelo de IA</h2>
            <p className="mt-1 text-sm text-gray-500">
              Permitir uso das minhas imagens para melhoria do modelo de IA
            </p>
          </div>
          <button
            onClick={handleToggleTraining}
            disabled={actionLoading === 'training'}
            className="text-gray-500 hover:text-brand-600 disabled:opacity-50"
            aria-label={consent?.training_opt_in ? 'Desativar uso para treinamento' : 'Ativar uso para treinamento'}
          >
            {consent?.training_opt_in ? (
              <ToggleRight className="h-8 w-8 text-brand-600" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Data Export */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-gray-900">Exportar meus dados</h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Baixe todos os seus dados pessoais, projetos e preferencias em formato JSON (LGPD Art. 18, V).
        </p>
        <button
          onClick={handleDataExport}
          disabled={actionLoading === 'export'}
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {actionLoading === 'export' ? 'Exportando...' : 'Exportar dados'}
        </button>
      </div>

      {/* Account Deletion */}
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Excluir conta</h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Sua conta sera marcada para exclusao. Seus dados serao removidos em ate 30 dias.
          Assinaturas ativas serao canceladas automaticamente.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={actionLoading === 'delete'}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {actionLoading === 'delete' ? 'Excluindo...' : 'Excluir minha conta'}
        </button>
      </div>
    </div>
  );
}
