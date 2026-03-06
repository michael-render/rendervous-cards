import { Link, useLocation } from 'react-router-dom';

const GalleryLink = () => {
  const location = useLocation();
  const isGallery = location.pathname === '/gallery';

  return (
    <div className="absolute top-5 right-5 z-20">
      {isGallery ? (
        <span
          className="inline-flex items-center rounded-lg px-4 py-2 card-font-display text-sm font-semibold"
          style={{
            border: '1px solid hsl(0 0% 100% / 0.25)',
            background: 'hsl(0 0% 100% / 0.08)',
            color: 'hsl(0 0% 100% / 0.75)',
          }}
        >
          Gallery
        </span>
      ) : (
        <Link
          to="/gallery"
          className="inline-flex items-center rounded-lg px-4 py-2 card-font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            border: '1px solid hsl(0 0% 100% / 0.28)',
            background: 'hsl(250 28% 16% / 0.75)',
            backdropFilter: 'blur(4px)',
          }}
        >
          Gallery
        </Link>
      )}
    </div>
  );
};

export default GalleryLink;
