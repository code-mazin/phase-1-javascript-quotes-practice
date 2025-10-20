document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.getElementById("quote-list");
    const quoteForm = document.getElementById("new-quote-form");
    const API_URL = "http://localhost:3000/quotes";

    // Track whether we're editing or adding
    let editMode = false;
    let editId = null;

    // Fetch and display quotes
    function fetchQuotes() {
        fetch(`${API_URL}?_embed=likes`)
            .then(res => res.json())
            .then(data => renderQuotes(data));
    }

    function renderQuotes(quotes) {
        // Clear existing panel
        quoteList.innerHTML = "";

        quotes.forEach(quote => {
            const li = document.createElement("li");
            li.classList.add("quote-card", "p-3");

            li.innerHTML = `
                <blockquote>
                    <p class="mb-0">${quote.quote}</p>
                    <footer class="blockquote-footer">${quote.author}</footer>
                    <br>
                    <button class='btn btn-success btn-sm' data-id="${quote.id}">Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
                    <button class='btn btn-danger btn-sm' data-id="${quote.id}">Delete</button>
                    <button class='btn btn-warning btn-sm' data-id="${quote.id}">Edit</button>
                </blockquote>
            `;

            quoteList.appendChild(li);
        });
    }

    // Handle form submission (Add or Edit)
    quoteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const quoteText = document.getElementById("new-quote").value.trim();
        const authorText = document.getElementById("author").value.trim();

        if (!quoteText || !authorText) return; // simple validation

        const formData = { quote: quoteText, author: authorText };

        if (editMode) {
            // --- Edit existing quote ---
            fetch(`${API_URL}/${editId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            .then(() => {
                fetchQuotes();
                quoteForm.reset();
                editMode = false;
                editId = null;
                quoteForm.querySelector("button[type='submit']").textContent = "Add Quote";
            });
        } else {
            // --- Add new quote ---
            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            .then(() => {
                fetchQuotes();
                quoteForm.reset();
            });
        }
    });

    // Handle Like / Delete / Edit buttons
    quoteList.addEventListener("click", (e) => {
        const id = e.target.dataset.id;

        // Like a quote
        if (e.target.classList.contains("btn-success")) {
            fetch("http://localhost:3000/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quoteId: parseInt(id) })
            })
            .then(() => fetchQuotes());
        }

        // Delete a quote
        if (e.target.classList.contains("btn-danger")) {
            fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(() => fetchQuotes());
        }

        // Edit a quote
        if (e.target.classList.contains("btn-warning")) {
            const blockquote = e.target.closest("blockquote");
            const quoteText = blockquote.querySelector("p").innerText;
            const authorText = blockquote.querySelector("footer").innerText;

            document.getElementById("new-quote").value = quoteText;
            document.getElementById("author").value = authorText;

            editMode = true;
            editId = id;
            quoteForm.querySelector("button[type='submit']").textContent = "Update Quote";
        }
    });

    // Load quotes on page start
    fetchQuotes();
});
