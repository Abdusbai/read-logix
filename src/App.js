import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

function sanitizeAndRenderHTML(html) {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return { __html: sanitizedHTML };
}

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "AIzaSyAWX7PooVcRd-KCeavwIYHPa7pjzidtn5U";

export default function App() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const [read, setRead] = useState(() => {
    const storedBooks = localStorage.getItem("books");
    return storedBooks ? JSON.parse(storedBooks) : [];
  });

  function HandleReadBook(book) {
    setRead((read) => [...read, book]);
  }

  function handleDeleteBook(id) {
    setRead((read) => read.filter((book) => book.id !== id));
  }

  function handleSelectedId(id) {
    setSelectedId(id);
    if (id === selectedId) {
      setSelectedId(null);
    }
  }

  function closeMovie() {
    setSelectedId(null);
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchBooks() {
        try {
          setSearchingBooks(true);
          setError("");
          const res = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=intitle:${query}&key=${KEY}&maxResults=20`,
            { signal: controller.signal }
          );

          const data = await res.json();
          if (data.totalItems === 0) throw new Error("Book not found !");

          setBooks(data.items);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            if (err.message === "Book not found !") setError(err.message);
            else setError(`Something went wrong, please try again later !`);
          }
        } finally {
          setSearchingBooks(false);
        }
      }

      if (query.length < 1) {
        setBooks([]);
        setError("PLease search for a book !");
        return;
      }

      fetchBooks();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(read));
  }, [read]);

  return (
    <>
      {
        <Main>
          <Header query={query} books={books} setQuery={setQuery} />
          <section>
            <BooksList
              books={books}
              searchingBooks={searchingBooks}
              error={error}
              handleSelectedId={handleSelectedId}
            />
            <BookMiddle
              selectedId={selectedId}
              HandleReadBook={HandleReadBook}
              handleDeleteBook={handleDeleteBook}
              read={read}
              closeMovie={closeMovie}
              handleSelectedId={handleSelectedId}
            />
            <TodoList />
          </section>
        </Main>
      }
    </>
  );
}

function Main({ children }) {
  return <div className="main">{children}</div>;
}

function Header({ query, setQuery, books }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      function callBack(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callBack);
      return () => document.removeEventListener("keydown", callBack);
    },
    [setQuery]
  );
  return (
    <header>
      <div className="logos">
        <img src="img/ReadLogix_logo_white.png" alt="logo" />
        <ul className="social-links">
          <li>
            <a
              href="https://web.facebook.com/Abdu314"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="social-icon"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/abdusbai/"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="social-icon"
                viewBox="0 0 24 24"
              >
                <path d="M14.829 6.302c-.738-.034-.96-.04-2.829-.04s-2.09.007-2.828.04c-1.899.087-2.783.986-2.87 2.87-.033.738-.041.959-.041 2.828s.008 2.09.041 2.829c.087 1.879.967 2.783 2.87 2.87.737.033.959.041 2.828.041 1.87 0 2.091-.007 2.829-.041 1.899-.086 2.782-.988 2.87-2.87.033-.738.04-.96.04-2.829s-.007-2.09-.04-2.828c-.088-1.883-.973-2.783-2.87-2.87zm-2.829 9.293c-1.985 0-3.595-1.609-3.595-3.595 0-1.985 1.61-3.594 3.595-3.594s3.595 1.609 3.595 3.594c0 1.985-1.61 3.595-3.595 3.595zm3.737-6.491c-.464 0-.84-.376-.84-.84 0-.464.376-.84.84-.84.464 0 .84.376.84.84 0 .463-.376.84-.84.84zm-1.404 2.896c0 1.289-1.045 2.333-2.333 2.333s-2.333-1.044-2.333-2.333c0-1.289 1.045-2.333 2.333-2.333s2.333 1.044 2.333 2.333zm-2.333-12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.958 14.886c-.115 2.545-1.532 3.955-4.071 4.072-.747.034-.986.042-2.887.042s-2.139-.008-2.886-.042c-2.544-.117-3.955-1.529-4.072-4.072-.034-.746-.042-.985-.042-2.886 0-1.901.008-2.139.042-2.886.117-2.544 1.529-3.955 4.072-4.071.747-.035.985-.043 2.886-.043s2.14.008 2.887.043c2.545.117 3.957 1.532 4.071 4.071.034.747.042.985.042 2.886 0 1.901-.008 2.14-.042 2.886z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://twitter.com/ASbaiOfficial"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="social-icon"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/sbai-abdessamad/"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="social-icon"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Abdusbai"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="social-icon"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
      <div className="header-search">
        <input
          type="text"
          name="search-input"
          placeholder="Search for book..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputEl}
        />
        <p>
          <span>{books?.length > 0 ? books.length : 0}</span> Results found
        </p>
      </div>
    </header>
  );
}

function BooksList({ books, searchingBooks, error, handleSelectedId }) {
  const [showBookList, setShowBookList] = useState(false);
  return (
    <div className="section">
      {showBookList ? (
        <CloseIcon setShowBookList={setShowBookList} />
      ) : (
        <OpenIcon setShowBookList={setShowBookList} />
      )}

      {!showBookList && (
        <>
          {searchingBooks && <Loader addClass={"pos-abs"} />}
          {!searchingBooks && !error && (
            <BookListUl books={books} handleSelectedId={handleSelectedId} />
          )}
          {error && <MessageError message={error} />}
        </>
      )}
    </div>
  );
}

function BookMiddle({
  selectedId,
  HandleReadBook,
  read,
  closeMovie,
  handleDeleteBook,
  handleSelectedId,
}) {
  const [showBookList, setShowBookList] = useState(false);
  return (
    <div className="section">
      {showBookList ? (
        <CloseIcon setShowBookList={setShowBookList} />
      ) : (
        <OpenIcon setShowBookList={setShowBookList} />
      )}

      {!showBookList &&
        (selectedId ? (
          <BookDetails
            selectedId={selectedId}
            HandleReadBook={HandleReadBook}
            closeMovie={closeMovie}
            read={read}
          />
        ) : (
          <ReadBooks
            read={read}
            handleDeleteBook={handleDeleteBook}
            handleSelectedId={handleSelectedId}
          />
        ))}
    </div>
  );
}

function BookDetails({ selectedId, HandleReadBook, closeMovie, read }) {
  const [isLoading, setIsLoading] = useState(false);
  const [book, setBook] = useState({});
  const [rating, setRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);
  const sanitizedDescription = sanitizeAndRenderHTML(
    book.volumeInfo?.description
  );

  const isRead = read.map((book) => book.id).includes(selectedId);
  const isReadRating = read.find((book) => book.id === selectedId)?.userRating;

  function handleAdd() {
    const newBook = {
      id: book?.id,
      title: book.volumeInfo?.title,
      img: book.volumeInfo?.imageLinks?.thumbnail,
      rating: Number(book.volumeInfo?.averageRating),
      userRating: Number(rating),
      pages: book.volumeInfo?.pageCount,
    };
    HandleReadBook(newBook);
    closeMovie();
  }

  useEffect(
    function () {
      async function getBookDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${selectedId}`
        );
        const data = await res.json();
        setBook(data);
        setIsLoading(false);
      }
      getBookDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!book.volumeInfo?.title) return;
      document.title = `Book | ${book.volumeInfo?.title}`;

      return function () {
        document.title = "Read Logix";
      };
    },
    [book.volumeInfo?.title]
  );

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          closeMovie();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [closeMovie]
  );

  return (
    <div className="book-details">
      <svg
        onClick={closeMovie}
        xmlns="http://www.w3.org/2000/svg"
        className="icon-back"
        viewBox="0 0 512 512"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
          d="M249.38 336L170 256l79.38-80M181.03 256H342"
        />
        <path
          d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
          fill="none"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeWidth="32"
        />
      </svg>
      {isLoading ? (
        <Loader addClass={"pos-abs"} />
      ) : (
        <>
          <BookDetailsHeader book={book} />
          <BookDetailsInfo
            isRead={isRead}
            isReadRating={isReadRating}
            tempRating={tempRating}
            setTempRating={setTempRating}
            rating={rating}
            setRating={setRating}
            handleAdd={handleAdd}
          />
          <BookDetailsDescription
            book={book}
            sanitizedDescription={sanitizedDescription}
          />
        </>
      )}
    </div>
  );
}

function BookDetailsHeader({ book }) {
  return (
    <div className="header">
      <img
        src={
          book.volumeInfo?.imageLinks
            ? book.volumeInfo?.imageLinks?.thumbnail
            : "img/no_img.jpg"
        }
        alt={book.volumeInfo?.title ? book.volumeInfo?.title : "None"}
      />
      <div className="infos">
        <h3>{book.volumeInfo?.title ? book.volumeInfo?.title : "None"}</h3>
        <p>
          <span>
            ✍🏻{" "}
            {book.volumeInfo?.authors
              ? book.volumeInfo?.authors.join(", ")
              : "None"}
          </span>
          <span>
            📅{" "}
            {book.volumeInfo?.publishedDate
              ? book.volumeInfo?.publishedDate.split("-")[0]
              : "None"}{" "}
            &nbsp; 📄{" "}
            {book.volumeInfo?.pageCount ? book.volumeInfo?.pageCount : "None"}
          </span>
          <span>
            📙{" "}
            {book.volumeInfo?.categories
              ? book.volumeInfo?.categories.join(", ")
              : "None"}
          </span>
          <span>
            ⭐{" "}
            {book.volumeInfo?.averageRating
              ? book.volumeInfo?.averageRating
              : 0}
          </span>
        </p>
      </div>
    </div>
  );
}

function BookDetailsInfo({
  isRead,
  isReadRating,
  tempRating,
  setTempRating,
  rating,
  setRating,
  handleAdd,
}) {
  return (
    <div className="more-infos">
      <div
        className="rating"
        style={isRead ? { justifyContent: "center" } : null}
      >
        {isRead ? (
          <p className="already-rated">
            You already rated this book with 🌟{isReadRating}
          </p>
        ) : (
          <>
            <div className="stars">
              <div className="st">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    onLeave={() => setTempRating(0)}
                    onEnter={() => setTempRating(i + 1)}
                    setRating={() => setRating(i + 1)}
                    full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
                  />
                ))}
              </div>
              <p className="stars-number">{tempRating || rating}</p>
            </div>
            <button
              className={
                rating === 0 ? "btn btn-add disabled-button" : "btn btn-add"
              }
              onClick={handleAdd}
            >
              + Add to list
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function BookDetailsDescription({ book, sanitizedDescription }) {
  return (
    <div className="desc">
      <em>
        {book.volumeInfo?.description ? (
          <div dangerouslySetInnerHTML={sanitizedDescription} />
        ) : (
          "No description Available"
        )}
      </em>
      <p>
        📖 Subtitle:{" "}
        {book.volumeInfo?.subtitle ? book.volumeInfo?.subtitle : "None"}
      </p>
      <p>
        📢 Publisher:{" "}
        {book.volumeInfo?.publisher ? book.volumeInfo?.publisher : "None"}
      </p>
      <p>
        🔠 Language:{" "}
        {book.volumeInfo?.language ? book.volumeInfo?.language : "None"}
      </p>
      <div className="descBtn">
        <a
          className="btn"
          rel="noreferrer"
          target="_blank"
          href={
            book.volumeInfo?.previewLink ? book.volumeInfo?.previewLink : "#"
          }
        >
          Preview
        </a>
        <a
          className={
            !book.accessInfo?.pdf?.isAvailable ||
            !book.accessInfo?.pdf?.downloadLink
              ? "btn disabled-button"
              : "btn"
          }
          rel="noreferrer"
          target="_blank"
          href={
            book.accessInfo?.pdf?.isAvailable &&
            book.accessInfo?.pdf?.downloadLink
              ? book.accessInfo?.pdf?.downloadLink
              : "#"
          }
        >
          {" "}
          Download PDF
        </a>
      </div>
    </div>
  );
}

function ReadBooks({ read, handleDeleteBook, handleSelectedId }) {
  return (
    <div className="list-books">
      <BookSummary read={read} />
      <ul className="read-list">
        {read.map((book) => (
          <ReadBooksLists
            book={book}
            key={book.id}
            handleDeleteBook={handleDeleteBook}
            handleSelectedId={handleSelectedId}
          />
        ))}
      </ul>
    </div>
  );
}

function BookSummary({ read }) {
  const avgRating = average(
    read.map((book) => (book.rating ? book.rating : 0))
  );
  const avgUserRating = average(
    read.map((book) => (book.userRating ? book.userRating : 0))
  );
  const avgPages = average(read.map((book) => (book.pages ? book.pages : 0)));
  return (
    <div className="header-list">
      <h3>Books you read</h3>
      <ul className="header-list-ls">
        <li>
          #️⃣ <span>{read.length} Books</span>
        </li>
        <li>
          ⭐ <span>{avgRating.toFixed(2)}</span>
        </li>
        <li>
          🌟 <span>{avgUserRating.toFixed(2)}</span>
        </li>
        <li>
          📄 <span>{avgPages.toFixed(0)} page</span>
        </li>
      </ul>
    </div>
  );
}

function ReadBooksLists({ book, handleDeleteBook, handleSelectedId }) {
  return (
    <li
      className="book-rd"
      onClick={(e) => {
        e.stopPropagation();
        handleSelectedId(book.id);
      }}
    >
      <img src={book.img ? book.img : "img/no_img.jpg"} alt={book.title} />
      <BookInfo book={book} />
      <span
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteBook(book.id);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="item-close"
          viewBox="0 0 512 512"
        >
          <path
            d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
            fill="none"
            stroke="currentColor"
            strokeMiterlimit="10"
            strokeWidth="32"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
            d="M320 320L192 192M192 320l128-128"
          />
        </svg>
      </span>
    </li>
  );
}

function BookInfo({ book }) {
  return (
    <div className="bk-info">
      <h3>{book.title}</h3>
      <ul>
        <li>⭐ {book.rating ? book.rating : 0}</li>
        <li>🌟 {book.userRating ? book.userRating : 0}</li>
        <li>📄 {book.pages ? book.pages : 0}</li>
      </ul>
    </div>
  );
}

function Star({ setRating, full, onEnter, onLeave }) {
  return (
    <span
      role="button"
      onClick={setRating}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {full ? (
        <svg
          xmlns=" http://www.w3.org/2000/svg"
          fill="#fcc419"
          viewBox="0 0 20 20"
          stroke="#fcc419"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#fcc419"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
        </svg>
      )}
    </span>
  );
}

function BookListUl({ books, handleSelectedId }) {
  return (
    <ul className="book-list">
      {books?.map((book) => (
        <Book key={book.id} book={book} handleSelectedId={handleSelectedId} />
      ))}
    </ul>
  );
}

function Book({ book, handleSelectedId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  let BookTitle = "";
  let show = false;
  if (isExpanded) {
    BookTitle = book.volumeInfo?.title;
  } else if (book.volumeInfo?.title.split(" ").length < 6) {
    BookTitle = book.volumeInfo?.title;
    show = true;
  } else {
    BookTitle = book.volumeInfo?.title.split(" ").slice(0, 6).join(" ") + "...";
  }

  return (
    <li
      onClick={(e) => {
        e.stopPropagation();
        handleSelectedId(book.id);
      }}
    >
      <img
        src={
          book.volumeInfo.imageLinks
            ? book.volumeInfo.imageLinks.thumbnail
            : "img/no_img.jpg"
        }
        alt={
          book.volumeInfo.imageLinks
            ? book.volumeInfo.imageLinks.thumbnail
            : "img/no_img.jpg"
        }
      />
      <div>
        <h3>
          {BookTitle}&nbsp;
          <span
            className="showMoreLess"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((t) => !t);
            }}
          >
            {show ? "" : isExpanded ? "show less" : "show more"}
          </span>
        </h3>
        <div className="details">
          <span>📅 {book.volumeInfo.publishedDate?.split("-")[0]}</span>
          <span>
            ✍🏻{" "}
            {book.volumeInfo.authors
              ? book.volumeInfo.authors.join(", ")
              : "None"}
          </span>
        </div>
      </div>
    </li>
  );
}

function Loader({ addClass }) {
  return <div className={`spinner ${addClass}`}></div>;
}

function MessageError({ message }) {
  return (
    <p className="message-error">
      <span>⛔</span> {message}
    </p>
  );
}

function CloseIcon({ setShowBookList }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => setShowBookList(false)}
      className="open-close"
      viewBox="0 0 512 512"
    >
      <path
        d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
        fill="none"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="32"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        d="M256 176v160M336 256H176"
      />
    </svg>
  );
}

function OpenIcon({ setShowBookList }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => setShowBookList(true)}
      className="open-close"
      viewBox="0 0 512 512"
    >
      <path
        d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
        fill="none"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="32"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        d="M336 256H176"
      />
    </svg>
  );
}

function TodoList({ userLogin }) {
  const [showBookList, setShowBookList] = useState(false);
  const [task, setAddTask] = useState(() => {
    const storedTasks = localStorage.getItem("tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  function handleAddTask(task) {
    setAddTask((t) => [...t, task]);
  }

  function handleDeleteTask(id) {
    setAddTask((t) => t.filter((task) => task.id !== id));
  }

  function handleUpdateTask(id) {
    setAddTask((t) =>
      t.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  function handleDeleteAllTasks() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all tasks ?"
    );
    if (confirmed) setAddTask([]);
  }

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(task));
  }, [task]);

  return (
    <div className="section">
      {showBookList ? (
        <CloseIcon setShowBookList={setShowBookList} />
      ) : (
        <OpenIcon setShowBookList={setShowBookList} />
      )}
      {!showBookList && (
        <div className="todoList-info">
          <TodoHeader
            userLogin={userLogin}
            handleAddTask={handleAddTask}
            handleDeleteAllTasks={handleDeleteAllTasks}
          />
          <div className="list-todo">
            <ul className="tasks">
              {task.map((task) => (
                <Task
                  key={task.id}
                  task={task}
                  handleDeleteTask={handleDeleteTask}
                  handleUpdateTask={handleUpdateTask}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Task({ task, handleDeleteTask, handleUpdateTask }) {
  return (
    <li className="task-element">
      <input
        readOnly
        type="checkbox"
        checked={task.done}
        id={task.id}
        value={task.done}
        onClick={() => handleUpdateTask(task.id)}
      />
      <label htmlFor={task.id} className={task.done ? "line-through" : ""}>
        {task.description}
      </label>
      <button onClick={() => handleDeleteTask(task.id)}>❌</button>
    </li>
  );
}

function TodoHeader({ handleAddTask, handleDeleteAllTasks }) {
  const [description, setDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!description) return;

    const newTask = { id: Date.now(), description, done: false };
    handleAddTask(newTask);
    setDescription("");
  }
  return (
    <form
      className="list-add"
      onSubmit={handleSubmit}
      name="todo-form"
      id="todo-form"
    >
      <input
        type="text"
        name="toto-input"
        className="todo-text"
        placeholder="Write something..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="addClear">
        <button className="todo-btn">Add</button>
        <button className="todo-btn" onClick={handleDeleteAllTasks}>
          Clear
        </button>
      </div>
    </form>
  );
}
