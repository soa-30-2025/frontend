<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Blogovi</h1>

    <!-- Dugme za otvaranje forme -->
    <button
      @click="showModal = true"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
    >
      Dodaj blog
    </button>

    <!-- Modal forma -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <h2 class="text-xl font-semibold mb-4">Novi blog</h2>

        <label class="block mb-2">
          Naslov
          <input
            v-model="newBlog.title"
            type="text"
            class="w-full border rounded px-2 py-1 mt-1"
          />
        </label>

        <label class="block mb-2">
          Opis 
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
            Sačuvaj
          </button>
          <button
            @click="showModal = false"
            class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Otkaži
          </button>
        </div>
      </div>
    </div>

    <!-- Lista blogova -->
    <div v-for="blog in blogs" :key="blog.id" class="mb-6 border-b pb-4">
      <h3 class="text-xl font-semibold">{{ blog.title }}</h3>
      <div class="text-gray-500 text-sm mb-2">
        {{ formatDate(blog.created_at) }}
      </div>
      <div v-html="renderMarkdown(blog.description)" class="prose"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { marked } from "marked";

// Lista blogova (trenutno lokalno)
const blogs = ref([
  {
    id: 1,
    title: "Primer bloga",
    description: "**Bold** tekst i [link](https://example.com)",
    created_at: new Date().toISOString(),
  },
]);

// Modal prikaz forme
const showModal = ref(false);

// Novi blog
const newBlog = reactive({
  title: "",
  description: "",
});

// Funkcija za slanje bloga na backend (API Gateway)
async function submitBlog() {
  if (!newBlog.title || !newBlog.description) {
    alert("Popunite naslov i opis!");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newBlog.title,
        description: newBlog.description,
        author_id: "123", // zameni sa stvarnim ID-em korisnika
      }),
    });

    if (!response.ok) throw new Error("Neuspešno kreiranje bloga");

    const data = await response.json();
    blogs.value.unshift({
      id: data.blog.id,
      title: data.blog.title,
      description: data.blog.description,
      created_at: new Date().toISOString(),
    });

    // Reset forme i zatvori modal
    newBlog.title = "";
    newBlog.description = "";
    showModal.value = false;
  } catch (err) {
    console.error(err);
    alert("Greška pri kreiranju bloga");
  }
}

// Markdown render
function renderMarkdown(text) {
  return marked(text);
}

// Formatiranje datuma
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}
</script>

<style scoped>
/* tailwind.css koristi .prose klasu za lepu tipografiju Markdown-a */
</style>
