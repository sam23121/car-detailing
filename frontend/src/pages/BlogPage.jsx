import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BlogPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/blog/?limit=50`)
      .then((res) => setPosts(res.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <main className="blog-page">
      <div className="blog-page-container">
        <h1>Blog</h1>
        <p className="subtitle">Tips and updates from Quality Mobile Detailing</p>
        {posts.length > 0 ? (
          <div className="blog-posts-list">
            {posts.map((post) => (
              <article key={post.id} className="blog-post-item" id={post.slug}>
                <h2>{post.title}</h2>
                <p className="meta">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                <div className="content">{post.content}</div>
              </article>
            ))}
          </div>
        ) : (
          <p className="no-posts">No blog posts yet. Check back soon!</p>
        )}
      </div>
    </main>
  );
}

export default BlogPage;
