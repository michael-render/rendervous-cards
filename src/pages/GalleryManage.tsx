import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { deleteCard, getCardThumbnailUrl, listCards } from '@/lib/api';

const STORAGE_KEY = 'gallery_manage_admin_token';

const GalleryManage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  const cardsQuery = useQuery({
    queryKey: ['cards'],
    queryFn: () => listCards(200, 0),
  });

  const deleteMutation = useMutation({
    mutationFn: async (cardId: string) => {
      if (!adminToken.trim()) {
        throw new Error('Admin token is required');
      }
      await deleteCard(cardId, adminToken.trim());
    },
    onSuccess: () => {
      setActiveDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });

  const canDelete = useMemo(() => adminToken.trim().length > 0, [adminToken]);

  const handleDelete = (cardId: string, cardName: string) => {
    if (!canDelete) return;
    const confirmed = window.confirm(`Delete "${cardName}"? This also removes stored images.`);
    if (!confirmed) return;
    setActiveDeleteId(cardId);
    deleteMutation.mutate(cardId);
  };

  const handleTokenChange = (value: string) => {
    setAdminToken(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return (
    <div className="min-h-screen px-4 py-12 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/gallery')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="card-font-display text-3xl font-bold text-foreground">Manage Gallery</h1>
          </div>
          <Link to="/gallery" className="card-font-display text-sm text-muted-foreground hover:text-foreground">
            View Gallery
          </Link>
        </div>

        <div className="rounded-xl border border-white/15 bg-black/20 p-4 mb-6">
          <label className="block card-font-display text-sm text-foreground mb-2">Admin Token</label>
          <input
            type="password"
            value={adminToken}
            onChange={(event) => handleTokenChange(event.target.value)}
            placeholder="Enter ADMIN_TOKEN"
            className="w-full px-3 py-2 card-font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={{
              background: 'hsl(240 30% 15%)',
              border: '2px solid hsl(260 35% 28%)',
            }}
          />
          {deleteMutation.isError && (
            <p className="card-font-body text-sm text-red-300 mt-2">
              {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Delete failed'}
            </p>
          )}
        </div>

        {cardsQuery.isLoading && (
          <p className="card-font-display text-xl text-muted-foreground">Loading cards...</p>
        )}

        {cardsQuery.isError && (
          <p className="card-font-display text-xl text-muted-foreground">
            {cardsQuery.error instanceof Error ? cardsQuery.error.message : 'Failed to load cards'}
          </p>
        )}

        {!cardsQuery.isLoading && !cardsQuery.isError && cardsQuery.data.length === 0 && (
          <p className="card-font-display text-xl text-muted-foreground">No cards found.</p>
        )}

        {!cardsQuery.isLoading && !cardsQuery.isError && cardsQuery.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cardsQuery.data.map((card) => (
              <article key={card.id} className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                <img
                  src={getCardThumbnailUrl(card.id)}
                  alt={`${card.name} card`}
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h2 className="card-font-display text-lg text-foreground leading-tight">{card.name}</h2>
                  <p className="card-font-body text-sm text-muted-foreground mt-1 mb-3">{card.archetype_title}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(card.id, card.name)}
                    disabled={!canDelete || deleteMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 card-font-display text-sm font-semibold text-white disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, hsl(350 60% 40%), hsl(10 70% 45%))',
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteMutation.isPending && activeDeleteId === card.id ? 'Deleting...' : 'Delete Card'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryManage;
