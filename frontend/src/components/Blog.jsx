import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Blog.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Blog({ id }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/blog/?limit=3`)
      .then((res) => setPosts(res.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id={id} className="blog-section">
      <div className="blog-container">
        <h2>From Our Blog</h2>
        <p>Tips and updates from Quality Mobile Detailing</p>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <div className="blog-grid">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link to={`/blog#${post.slug}`} key={post.id} className="blog-card">
                  <h3>{post.title}</h3>
                  <p>{post.content?.slice(0, 120)}...</p>
                  <span>Read more →</span>
                </Link>
              ))
            ) : (
              <p className="no-posts">No blog posts yet.</p>
            )}
          </div>
        )}
        <div className="blog-cta">
          <Link to="/blog" className="btn btn-primary">View All Posts</Link>
        </div>
      </div>
    </section>
  );
}

export default Blog;
