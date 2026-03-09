'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ConsentStatus {
  lgpd_consent_at: string | null;
  lgpd_consent_version: string | null;
  training_opt_in: boolean;
  has_consent: boolean;
}

export default function PrivacyPage() {
  const [consent, setConsent] = useState<ConsentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }, [supabase]);

  const fetchConsent = useCallback(async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/users/me/consent`, { headers });
      const json = await res.json();
      setConsent(json.data);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar status de consentimento.' });
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchConsent();
  }, [fetchConsent]);

  const handleRevokeConsent = async () => {
    if (!confirm('Ao revogar o consentimento, voce nao podera mais processar imagens. Deseja continuar?')) {
      return;
    }

    setActionLoading('revoke');
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/users/me/consent`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        setConsent(json.data);
        setMessage({ type: 'success', text: 'Consentimento revogado com sucesso.' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao revogar consentimento.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao revogar consentimento.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantConsent = async () => {
    setActionLoading('grant');
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/users/me/consent`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ consent_version: '1.0' }),
      });

      if (res.ok) {
        const json = await res.json();
        setConsent(json.data);
        setMessage({ type: 'success', text: 'Consentimento concedido com sucesso.' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao conceder consentimento.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao conceder consentimento.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleTraining = async () => {
    if (!consent) return;
    setActionLoading('training');
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/users/me/training-opt-in`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ training_opt_in: !consent.training_opt_in }),
      });

      if (res.ok) {
        const json = await res.json();
        setConsent(json.data);
        setMessage({
          type: 'success',
          text: json.data.training_opt_in
            ? 'Uso para melhoria de IA ativado.'
            : 'Uso para melhoria de IA desativado.',
        });
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar preferencia.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao atualizar preferencia.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDataExport = async () => {
    setActionLoading('export');
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/users/me/data-export`, { headers });

      if (res.ok) {
        const json = await res.json();
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decorai-dados-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Dados exportados com sucesso.' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao exportar dados.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao exportar dados.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('ATENCAO: Esta acao e irreversivel. Sua conta sera excluida e seus dados removidos em ate 30 dias. Deseja continuar?')) {
      return;
    }

    setActionLoading('delete');
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Conta marcada para exclusao. Voce sera desconectado.' });
        setTimeout(async () => {
          await supabase.auth.signOut();
          window.location.href = '/login';
        }, 2000);
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

  const consentDate = consent?.lgpd_consent_at
    ? new Date(consent.lgpd_consent_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Privacidade</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie seu consentimento LGPD e preferencias de dados.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Consent Status */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Consentimento LGPD</h2>
        <p className="mt-1 text-sm text-gray-500">
          Status do seu consentimento para processamento de imagens.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Status:</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              consent?.has_consent
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {consent?.has_consent ? 'Consentimento ativo' : 'Sem consentimento'}
            </span>
          </div>

          {consentDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Data do consentimento:</span>
              <span className="text-sm text-gray-500">{consentDate}</span>
            </div>
          )}

          {consent?.lgpd_consent_version && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Versao:</span>
              <span className="text-sm text-gray-500">v{consent.lgpd_consent_version}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          {consent?.has_consent ? (
            <button
              type="button"
              onClick={handleRevokeConsent}
              disabled={actionLoading === 'revoke'}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading === 'revoke' ? 'Revogando...' : 'Revogar consentimento'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGrantConsent}
              disabled={actionLoading === 'grant'}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {actionLoading === 'grant' ? 'Concedendo...' : 'Conceder consentimento'}
            </button>
          )}
        </div>
      </section>

      {/* Training Opt-in */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Melhoria de IA</h2>
            <p className="mt-1 text-sm text-gray-500">
              Permitir uso das minhas imagens para melhoria do modelo de IA.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={consent?.training_opt_in ?? false}
            onClick={handleToggleTraining}
            disabled={actionLoading === 'training'}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 ${
              consent?.training_opt_in ? 'bg-brand-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                consent?.training_opt_in ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Padrao: desativado (opt-out). Conforme NFR-09, suas imagens nao sao usadas para treinamento sem autorizacao explicita.
        </p>
      </section>

      {/* Data Export */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Exportar meus dados</h2>
        <p className="mt-1 text-sm text-gray-500">
          Baixe uma copia de todos os seus dados pessoais, projetos, renders e preferencias (LGPD Art. 18, V).
        </p>
        <button
          type="button"
          onClick={handleDataExport}
          disabled={actionLoading === 'export'}
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {actionLoading === 'export' ? 'Exportando...' : 'Exportar dados'}
        </button>
      </section>

      {/* Account Deletion */}
      <section className="rounded-lg border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-900">Excluir conta</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ao excluir sua conta, seus dados serao removidos em ate 30 dias. Assinaturas ativas serao canceladas automaticamente.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={actionLoading === 'delete'}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {actionLoading === 'delete' ? 'Excluindo...' : 'Excluir minha conta'}
        </button>
      </section>
    </div>
  );
}
