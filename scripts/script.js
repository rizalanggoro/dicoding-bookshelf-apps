class BookshelfRepository {
  #readBooks() {
    let books = [];
    const data = localStorage.getItem("books");
    if (data) books = JSON.parse(data);
    return books;
  }

  #writeBooks(books) {
    localStorage.setItem("books", JSON.stringify(books));
  }

  create(newBook) {
    let books = this.#readBooks();
    books.push(newBook);
    this.#writeBooks(books);
  }

  readAll() {
    return this.#readBooks();
  }

  readById(id) {
    const books = [...this.#readBooks()].filter(
      (item) => item.id === Number(id)
    );

    if (books.length > 0) {
      return books[0];
    }

    return undefined;
  }

  readByTitle(title) {
    return [...this.#readBooks()].filter(
      (item) =>
        String(item.title)
          .toLowerCase()
          .indexOf(String(title).toLowerCase()) !== -1
    );
  }

  updateStatusById(id, isComplete) {
    const books = [...this.#readBooks()];
    books.map((item) => {
      if (item.id === id) {
        return (item.isComplete = isComplete);
      }

      return item;
    });

    this.#writeBooks(books);
  }

  deleteById(id) {
    const books = [...this.#readBooks()];
    const newBooks = books.filter((item) => {
      if (item.id !== Number(id)) {
        return item;
      }
    });

    this.#writeBooks(newBooks);
  }
}

const repository = new BookshelfRepository();

// form create book
const formCreateBook = document.getElementById("form-create-book");
formCreateBook.addEventListener("submit", (e) => {
  e.preventDefault();

  let newBook = {
    id: new Date().getTime(),
  };

  formCreateBook.querySelectorAll("input[name]").forEach((item) => {
    const name = item.getAttribute("name");
    const value = item.value;

    if (name === "year") newBook[name] = Number(value);
    else if (name === "isComplete") newBook[name] = item.checked;
    else newBook[name] = value;
  });

  repository.create(newBook);
  notifyListChanged();

  // reset form
  formCreateBook.querySelectorAll("input[name]").forEach((item) => {
    if (item.getAttribute("name") === "isComplete") {
      item.checked = false;
    } else {
      item.value = "";
    }
  });
});

// list books
const listBooksUndoneEl = document.getElementById("list-books-undone");
const listBooksDoneEl = document.getElementById("list-books-done");

const onListItemClickMarkDone = (id) => {
  if (id) {
    repository.updateStatusById(id, true);
    notifyListChanged();
  }
};

const onListItemClickMarkUndone = (id) => {
  if (id) {
    repository.updateStatusById(id, false);
    notifyListChanged();
  }
};

const modalConfirmDeleteEl = document.getElementById("modal-confirm-delete");
const renderModalConfirmDelete = () => {
  const id = modalConfirmDeleteEl.getAttribute("value");
  const book = repository.readById(id);

  if (book) {
    modalConfirmDeleteEl.classList.add("flex");
    modalConfirmDeleteEl.classList.remove("hidden");
    document.querySelector("body").classList.add("overflow-hidden");

    const descriptionEl = document.getElementById(
      "modal-confirm-delete-description"
    );
    descriptionEl.innerHTML = descriptionEl.innerHTML
      .replace("{title}", book.title)
      .replace("{author}", book.author);
  } else {
    modalConfirmDeleteEl.classList.add("hidden");
    modalConfirmDeleteEl.classList.remove("flex");
    document.querySelector("body").classList.remove("overflow-hidden");
  }
};

const onClickCancelModalConfirmDelete = () => {
  modalConfirmDeleteEl.removeAttribute("value");
  renderModalConfirmDelete();
};

const onClickDeleteModalConfirmDelete = () => {
  const id = modalConfirmDeleteEl.getAttribute("value");
  if (id) {
    repository.deleteById(id);
    modalConfirmDeleteEl.removeAttribute("value");
    renderModalConfirmDelete();
    notifyListChanged();
  }
};

const onListItemClickDelete = (id) => {
  if (id) {
    modalConfirmDeleteEl.setAttribute("value", id);
    renderModalConfirmDelete();
  }
};

const notifyListChanged = () => {
  renderListBooks();
  renderListBooksSearched();
};

const listItemBook = (book) => {
  return `
    <li class="border rounded-md py-4 px-6 gap-2 flex items-center">
      <div class="flex-1">
        <h3 class="font-semibold text-lg ${
          book.isComplete ? "line-through" : ""
        }">${book.title}</h3>
        <p class="text-sm mt-1">
          <span class="bg-lime-100 text-lime-700 font-semibold rounded-full px-2 py-1 text-xs">${
            book.year
          }</span>
          ~ ${book.author}
        </p>
      </div>
      <div class="space-x-2">
        <button class="text-red-600 hover:opacity-70 duration-300" onclick="onListItemClickDelete(${
          book.id
        })">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
        <button class="text-lime-700 hover:opacity-70 duration-300" onclick="${
          book.isComplete
            ? "onListItemClickMarkUndone"
            : "onListItemClickMarkDone"
        }(${book.id})">
          ${
            book.isComplete
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>`
          }
        </button>
      </div>
    </li>
  `;
};

const renderListBooks = () => {
  const allBooks = [...repository.readAll()];

  listBooksUndoneEl.innerHTML = allBooks
    .filter((item) => !item.isComplete)
    .map((item) => listItemBook(item))
    .join("");

  listBooksDoneEl.innerHTML = allBooks
    .filter((item) => item.isComplete)
    .map((item) => listItemBook(item))
    .join("");
};

renderListBooks();

// form search book
const listBooksSearchedEl = document.getElementById("list-books-searched");
const formSearchBookEl = document.getElementById("form-search-book");

const renderListBooksSearched = () => {
  const title = formSearchBookEl.querySelector(`input[name="title"]`).value;

  if (title.length > 0) {
    const books = repository.readByTitle(title);

    if (books.length > 0) {
      listBooksSearchedEl.classList.remove("hidden");
      listBooksSearchedEl.innerHTML = books
        .map((item) => listItemBook(item))
        .join("");

      return;
    }
  }
  listBooksSearchedEl.classList.add("hidden");
};

formSearchBookEl.addEventListener("submit", (e) => {
  e.preventDefault();
  renderListBooksSearched();
});
