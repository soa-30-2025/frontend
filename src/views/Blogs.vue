<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Blogs</h1>
    <button
      @click="showModal = true"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
    >
      Add blog
    </button>
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <h2 class="text-xl font-semibold mb-4">New blog</h2>
        <label class="block mb-2">
          Title
          <input
            v-model="newBlog.title"
            type="text"
            class="w-full border rounded px-2 py-1 mt-1"
          />
        </label>
        <label class="block mb-2">
          Caption 
          <textarea
            v-model="newBlog.description"
            rows="5"
            class="w-full border rounded px-2 py-1 mt-1"
          ></textarea>
        </label>
        <div class="flex justify-end mt-4 gap-2">
          <button
            @click="submitBlog"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save
          </button>
          <button
            @click="showModal = false"
            class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    <div v-for="blog in blogs" :key="blog.id" class="mb-6 border-b pb-4">
      <div v-html="renderMarkdown(blog.title)" class="prose text-xl font-semibold mb-1"></div>
      <div class="text-gray-500 text-sm mb-2">{{ formatDate(blog.created_at) }}</div>
      <div v-html="renderMarkdown(blog.description)" class="prose mb-2"></div>
        <button 
          @click="toggleComments(blog.id)" 
          class="mt-2 text-blue-500 hover:underline"
        >
          {{ showCommentsFor[blog.id] ? 'Hide comments' : 'View all comments' }}
        </button>
        <div>Likes: {{ likeCounts[blog.id] || 0 }}</div>
      <div class="flex gap-4 mb-2">
        <button
          :class="[
            'px-4 py-1 rounded text-white',
            likedByUser[blog.id] ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
          ]"
          @click="toggleLike(blog.id)"
        >
          {{ likedByUser[blog.id] ? 'Unlike' : 'Like' }}
        </button>
        <button
          class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          @click="toggleComment(blog.id)"
        >
          Comment
        </button>
      </div>
      <div v-if="activeCommentBox === blog.id" class="mt-2">
        <textarea
          v-model="commentText"
          placeholder="Write a comment..."
          class="w-full border rounded px-2 py-1 mb-2"
        ></textarea>
        <div class="flex gap-2">
          <button
            @click="submitComment(blog.id)"
            class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Comment
          </button>
          <button
            @click="cancelComment"
            class="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
      <div v-if="showCommentsFor[blog.id]" class="mt-4 border-t pt-2">
        <div v-if="loadingComments">Loading comments...</div>
        <div v-else>
          <div v-if="comments[blog.id]?.length === 0" class="text-gray-500 italic">No comments yet</div>
            <div v-for="comment in comments[blog.id]" :key="comment.id" class="mb-2 border-b pb-2">
              <div v-if="editingCommentId === comment.id">
                <textarea
                  v-model="editedText"
                  class="w-full border rounded px-2 py-1 mb-2"
                ></textarea>
                <button
                  @click="saveEditedComment(blog.id, comment.id)"
                  class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                >
                  Save
                </button>
                <button
                  @click="() => { editingCommentId = null; editedText = '' }"
                  class="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
              <div v-else>
                <p class="text-sm">{{ comment.text }}</p>
                <p class="text-xs text-gray-400">
                  By: {{ comment.author_name || 'Anon' }} • {{ formatDate(comment.created_at) }}
                </p>
                <div v-if="comment.userId === currentUserId" class="mt-1">
                  <button
                    @click="startEditing(comment)"
                    class="text-blue-500 text-sm hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { marked } from "marked";
import { fetchBlogs, createBlog, createComment, loadComments, getLikedUsers, getLikesCount, likeBlog, unlikeBlog, updateComment  } from "@/api/blogs";
import { getById  } from "@/api/stakeholder";

const currentUserId = ref(null);
const likedByUser = reactive({});
const likeCounts = reactive({});

const blogs = ref([]);
const showModal = ref(false);
const newBlog = reactive({
  title: "",
  description: "",
});

const showCommentsFor = reactive({})
const comments = reactive({})
const loadingComments = ref(false)
const editingCommentId = ref(null);
const editedText = ref("");

function cancelComment() {
  activeCommentBox.value = null;
  commentText.value = "";
}

function startEditing(comment) {
  const currentUserId = sessionStorage.getItem("id");
  if (comment.userId !== currentUserId) {
    alert("Možete menjati samo svoje komentare!");
    return;
  }
  editingCommentId.value = comment.id;
  editedText.value = comment.text;
}

async function saveEditedComment(blogId, commentId) {
  try {
    await updateComment(commentId, editedText.value);
    const commentList = comments[blogId];
    const index = commentList.findIndex(c => c.id === commentId);
    if (index !== -1) {
      commentList[index].text = editedText.value;
    }
    editingCommentId.value = null;
    editedText.value = "";
  } catch (err) {
    console.error("Greška pri ažuriranju komentara:", err);
    alert("Neuspešan update komentara");
  }
}


async function loadLikes(blogId) {
  try {
    const currentUserId = sessionStorage.getItem("id") || sessionStorage.getItem("userId") || null;
    const data = await getLikedUsers(blogId);
    const userIds = Array.isArray(data) ? data : (data.user_ids || data.userIds || []);

    likedByUser[blogId] = currentUserId ? userIds.includes(currentUserId) : false;

    const countData = await getLikesCount(blogId);
    likeCounts[blogId] = (countData && (countData.likes_count ?? countData.likesCount ?? countData.count)) || 0;

  } catch (err) {
    console.error("Error loading likes:", err);
    likedByUser[blogId] = false;
    likeCounts[blogId] = likeCounts[blogId] || 0;
  }
}

async function toggleLike(blogId) {
  try {
    if (likedByUser[blogId]) {
      await unlikeBlog(blogId);
      likedByUser[blogId] = false;
      likeCounts[blogId] = Math.max(0, (likeCounts[blogId] || 1) - 1);
    } else {
      await likeBlog(blogId);
      likedByUser[blogId] = true;
      likeCounts[blogId] = (likeCounts[blogId] || 0) + 1;
    }
  } catch (err) {
    console.error("Failed to toggle like:", err);
  }
}

async function loadBlogs() {
  try {
    blogs.value = await fetchBlogs();
    for (const blog of blogs.value) {
      await loadLikes(blog.id);
    }

  } catch (err) {
    console.error(err);
    alert("Greška pri učitavanju blogova");
  }
}

async function submitBlog() {
  if (!newBlog.title || !newBlog.description) {
    alert("Popunite naslov i opis!");
    return;
  }

  try {
    const newEntry = await createBlog(newBlog);
    blogs.value.unshift(newEntry);
    newBlog.title = "";
    newBlog.description = "";
    showModal.value = false;
  } catch (err) {
    console.error(err);
    alert("Greška pri kreiranju bloga");
  }
}

function parseTimestamp(ts) {
  if (!ts) return new Date();
  return new Date(ts.seconds * 1000 + ts.nanos / 1000000);
}

function formatDate(ts) {
  const d = parseTimestamp(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

function renderMarkdown(text) {
  return marked(text);
}

const activeCommentBox = ref(null);
const commentText = ref("");

async function submitComment(blogId) {
  if (!commentText.value.trim()) {
    alert("Unesite tekst komentara!");
    return;
  }

  try {
    await createComment(blogId, commentText.value);
    alert("Komentar uspešno dodat!");
    commentText.value = "";
    activeCommentBox.value = null;
  } catch (err) {
    console.error(err);
    alert("Greška pri dodavanju komentara");
  }
}

const toggleComments = async (blogId) => {
  showCommentsFor[blogId] = !showCommentsFor[blogId];

  if (showCommentsFor[blogId] && !comments[blogId]) {
    loadingComments.value = true;
    try {
      comments[blogId] = await loadComments(blogId);
    } catch (err) {
      console.error("Greška pri učitavanju komentara:", err);
    } finally {
      loadingComments.value = false;
    }
  }
};

function toggleComment(blogId) {
  if (activeCommentBox.value === blogId) {
    activeCommentBox.value = null;
    commentText.value = "";
  } else {
    activeCommentBox.value = blogId;
  }
}

onMounted(() => {
  loadBlogs()
  currentUserId.value = sessionStorage.getItem("id") || sessionStorage.getItem("userId");
});
</script>


<style scoped>

</style>
