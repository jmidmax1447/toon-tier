import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import './Home.css';

export default function Home() {
  const [featuredImages, setFeaturedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadFeaturedCartoons() {
      const { data, error: fetchError } = await supabase
        .from('cartoons')
        .select('cover_image_url')
        .not('cover_image_url', 'is', null)
        .limit(6);

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setFeaturedImages([]);
      } else {
        const imageUrls = (data ?? [])
          .map(({ cover_image_url }) => cover_image_url)
          .filter(Boolean)
          .slice(0, 8);
        setFeaturedImages(imageUrls);
      }

      setLoading(false);
    }

    loadFeaturedCartoons();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (featuredImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredImages]);

  useEffect(() => {
    if (currentIndex >= featuredImages.length) setCurrentIndex(0);
  }, [currentIndex, featuredImages.length]);

  const currentImage = featuredImages[currentIndex];
  const tintClass = useMemo(() => {
    const tintClasses = ['tt-home-tint-aqua', 'tt-home-tint-pink', 'tt-home-tint-gold'];
    return tintClasses[currentIndex % tintClasses.length];
  }, [currentIndex]);

  return (
    <section className="tt-home-hero">
      {currentImage && (
        <div className={`tt-home-bg ${tintClass}`} aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentImage}-${currentIndex}`}
              className="tt-home-bg-image"
              style={{ backgroundImage: `url(${currentImage})` }}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            />
          </AnimatePresence>
          <div className="tt-home-bg-gradient" />
        </div>
      )}

      <div className="tt-home-content">
        <h1 className="tt-home-title">ToonTier</h1>
        <p className="tt-home-subtitle">
          Discover, rate, and track your favorite animated series with a community built for cartoon fans.
        </p>

        <div className="tt-hero-actions">
          <Link to="/cartoons" className="tt-btn tt-btn-primary">Browse Cartoons</Link>
        </div>

        {loading && <p className="tt-home-status">Loading featured cartoons…</p>}
        {!loading && error && (
          <p className="tt-home-status tt-home-status-error" role="alert">
            Could not load featured cartoons right now: {error}
          </p>
        )}
        {!loading && !error && featuredImages.length === 0 && (
          <p className="tt-home-status">No featured cartoons available yet.</p>
        )}

        {!loading && !error && currentImage && (
          <>
            <div className="tt-home-featured-frame">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${currentImage}-${currentIndex}`}
                  src={currentImage}
                  alt="Featured cartoon cover"
                  className="tt-home-featured-image"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  exit={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                />
              </AnimatePresence>
            </div>

            {featuredImages.length > 1 && (
              <div className="tt-home-dots" aria-label="Featured cartoon carousel navigation">
                {featuredImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    className={`tt-home-dot${index === currentIndex ? ' is-active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Show featured cartoon ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
