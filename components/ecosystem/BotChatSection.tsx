'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { confirmNicheAfterBot, getBotHistory, sendBotMessage } from '@/lib/ecosystem';
import { stripNicheConfirmedTag } from '@/lib/ecosystem-chat';
import type { EcosystemBotMessage, NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { MarkdownBotContent } from '@/components/ecosystem/MarkdownBotContent';

function isBotMessage(m: EcosystemBotMessage): boolean {
  const t = (m.senderType ?? m.role ?? '').toUpperCase();
  if (t.includes('BOT')) return true;
  if (t.includes('HUMAN') || t.includes('USER')) return false;
  return false;
}

function lastBotMessage(messages: EcosystemBotMessage[]): EcosystemBotMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isBotMessage(messages[i])) return messages[i];
  }
  return undefined;
}

/** Masque le handshake technique (affiché en double si double bootstrap). */
function isBootstrapHandshake(m: EcosystemBotMessage): boolean {
  const t = (m.senderType ?? m.role ?? '').toUpperCase();
  const humanLike = t.includes('HUMAN') || t.includes('USER');
  return humanLike && m.content?.trim().toUpperCase() === 'START_CONVERSATION';
}

type Props = {
  request: NicheRequestResponse;
  onRefreshRequest: () => Promise<void>;
};

export function BotChatSection({ request, onRefreshRequest }: Props) {
  const [messages, setMessages] = useState<EcosystemBotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      let list = await getBotHistory(request.id);
      if (list.length === 0) {
        await sendBotMessage(request.id, 'START_CONVERSATION');
        list = await getBotHistory(request.id);
      }
      setMessages(list);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger la conversation.'));
    } finally {
      setLoadingHistory(false);
    }
  }, [request.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botConfirmed = request.botConfirmed;

  const visibleMessages = messages.filter((m) => !isBootstrapHandshake(m));

  const lastBot = lastBotMessage(messages);
  const assistantMarkedReady =
    lastBot != null && /\[NICHE_CONFIRMED\]/i.test(lastBot.content ?? '');

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || botConfirmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendBotMessage(request.id, trimmed);
      const synced = await getBotHistory(request.id);
      setMessages(synced);
      setInput('');
    } catch (e) {
      setError(getApiErrorMessage(e, "Impossible d'envoyer le message."));
    } finally {
      setSending(false);
    }
  };

  const handleConfirmToTeam = async () => {
    if (botConfirmed || confirming) return;
    setConfirming(true);
    setError(null);
    try {
      await confirmNicheAfterBot(request.id);
      await onRefreshRequest();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de confirmer pour le moment.'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <section className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Confirmation avec l&apos;assistant</h2>
      <p className="mt-1 text-sm text-gray-600">
        Affinez votre niche avec l&apos;IA. Le passage à l&apos;équipe se fait uniquement lorsque vous validez
        explicitement en bas de page.
      </p>

      {error && (
        <div className="mt-4">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {botConfirmed && (
        <div
          className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900"
          role="status"
        >
          ✅ Niche confirmée — votre dossier est transmis à l&apos;équipe.
        </div>
      )}

      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        {loadingHistory ? (
          <div className="flex justify-center py-8 text-sm text-gray-500">
            <span className="animate-pulse">Chargement…</span>
          </div>
        ) : (
          visibleMessages.map((m) => {
            const bot = isBotMessage(m);
            const displayText = bot ? stripNicheConfirmedTag(m.content) : m.content;
            return (
              <div key={m.id} className={`flex ${bot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    bot ? 'rounded-tl-none bg-teal-50 text-gray-900' : 'rounded-tr-none bg-blue-500 text-white'
                  }`}
                >
                  {bot && <span className="mr-2 text-base" aria-hidden>🤖</span>}
                  <div className={bot ? '' : 'whitespace-pre-wrap'}>
                    {bot ? (
                      <MarkdownBotContent text={displayText} />
                    ) : (
                      displayText
                    )}
                  </div>
                  <div className={`mt-1 text-[10px] ${bot ? 'text-teal-700/80' : 'text-blue-100'}`}>
                    {new Date(m.sentAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {!botConfirmed && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label htmlFor="bot-input" className="sr-only">
            Votre message
          </label>
          <textarea
            id="bot-input"
            rows={2}
            disabled={sending}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message…"
            className="min-h-[72px] flex-1 resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <button
            type="button"
            disabled={sending || !input.trim()}
            onClick={() => void handleSend()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {sending ? <span aria-live="polite">Envoi...</span> : 'Envoyer'}
          </button>
        </div>
      )}

      {!botConfirmed && (
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-sm text-gray-800">
            Quand la niche vous convient, confirmez pour envoyer le dossier à l&apos;équipe (étape suivante : agent
            dédié).
          </p>
          {assistantMarkedReady && (
            <p className="mt-2 text-xs font-medium text-indigo-900">
              L&apos;assistant signale que la niche est prête — vous pouvez valider ci-dessous.
            </p>
          )}
          <button
            type="button"
            disabled={confirming}
            onClick={() => void handleConfirmToTeam()}
            className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
          >
            {confirming ? 'Confirmation…' : "Confirmer ma niche et transmettre à l'équipe"}
          </button>
        </div>
      )}

      {botConfirmed && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              void onRefreshRequest();
            }}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Actualiser le dossier →
          </button>
        </div>
      )}
    </section>
  );
}
