const API_URL = "http://localhost:8000/api";
import { getById } from "@/api/stakeholder";
import { isFollowing } from '@/api/followings';

export async function fetchBlogs() {
  const token = sessionStorage.getItem("jwtToken");
  const currentUserId = sessionStorage.getItem("id"); 

  try {
    const res = await fetch("http://localhost:8000/api/blogs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      throw new Error(`Neuspešno učitavanje blogova: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.blogs)) {
      console.warn("Nema dostupnih blogova ili nevalidan format odgovora");
      return [];
    }

    if (data.blogs.length === 0) {
      console.warn("Nema dostupnih blogova");
      return [];
    }

    const filteredBlogs = await filterBlogsByFollowing(data.blogs, currentUserId);

    return filteredBlogs.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      created_at: b.created_at,
      author_id: b.authorId
    }));

  } catch (error) {
    console.error("Greška u fetchBlogs:", error);
    throw error;
  }
}

async function filterBlogsByFollowing(blogs, currentUserId) {
  if (!currentUserId) {
    console.warn("Nema ID trenutnog korisnika");
    return blogs;
  }

  const filteredBlogs = [];
  
  for (const blog of blogs) {
    try {
      if (blog.authorId === currentUserId) {
        filteredBlogs.push(blog);
        continue;
      }
      
      const followingResponse = await isFollowing(currentUserId, blog.authorId);
      const isFollowingAuthor = followingResponse.following;
      
      console.log(`Korisnik ${currentUserId} prati autora ${blog.authorId}:`, isFollowingAuthor);
      
      if (isFollowingAuthor) {
        filteredBlogs.push(blog);
      }
    } catch (error) {
      console.error(`Greška pri proveri praćenja za autora ${blog.authorId}:`, error);
    }
  }
  
  return filteredBlogs;
}
export async function createBlog(newBlog) {
  const token = sessionStorage.getItem("jwtToken");

  const response = await fetch(`${API_URL}/blog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: newBlog.title,
      description: newBlog.description,
    }),
  });

  if (!response.ok) throw new Error("Neuspešno kreiranje bloga");

  const data = await response.json();
  return {
    id: data.blog.id,
    title: data.blog.title,
    description: data.blog.description,
    created_at: new Date().toISOString(),
  };
}

export async function createComment(blogId, text) {
  const token = sessionStorage.getItem("jwtToken");

  const res = await fetch("http://localhost:8000/api/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      blog_id: blogId,
      text: text,
    }),
  });

  if (!res.ok) throw new Error("Neuspešno kreiranje komentara");

  return await res.json();
}

export async function loadComments(blogId) {
  try {
    const token = sessionStorage.getItem("jwtToken");

    const res = await fetch(`${API_URL}/comments/${blogId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch comments");

    const data = await res.json();
    const rawComments = data.comments || [];

    const commentsWithUsers = await Promise.all(
      rawComments.map(async (comment) => {
        try {
          const user = await getById(comment.userId);
          return {
            ...comment,
            author_name: user?.user?.username || "Anon",
          };
        } catch (err) {
          console.error("Error loading user for comment:", err);
          return {
            ...comment,
            author_name: "Anon",
          };
        }
      })
    );

    return commentsWithUsers;
  } catch (err) {
    console.error("Failed to load comments:", err);
    throw err;
  }
}

export async function getLikedUsers(blogId) {
  const token = sessionStorage.getItem("jwtToken");
  const res = await fetch(`${API_URL}/blogs/liked-users?blog_id=${blogId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch liked users");
  return await res.json(); 
}

export async function likeBlog(blogId) {
  const token = sessionStorage.getItem("jwtToken");
  const res = await fetch(`${API_URL}/blog/${blogId}/like`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to like blog");
  return await res.json();
}

export async function unlikeBlog(blogId) {
  const token = sessionStorage.getItem("jwtToken");
  const res = await fetch(`${API_URL}/blog/${blogId}/dislike`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to unlike blog");
  return await res.json();
}

export async function getLikesCount(blogId) {
  const token = sessionStorage.getItem("jwtToken");
  const res = await fetch(`${API_URL}/blog/${blogId}/likes`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch likes count");
  return await res.json(); 
}

export async function updateComment(commentId, newText) {
  const token = sessionStorage.getItem("jwtToken");

  const res = await fetch(`${API_URL}/comment/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ id: commentId, text: newText }),
  });

  if (!res.ok) throw new Error("Neuspešan update komentara");
  return await res.json();
}


