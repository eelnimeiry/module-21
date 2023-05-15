import React, { useState, useEffect } from "react";
import {
  Jumbotron,
  Container,
  Col,
  Form,
  Button,
  Card,
  CardColumns,
} from "react-bootstrap";

import Auth from "../utils/auth";
import { searchGoogleBooks } from "../utils/API";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import { useMutation } from "@apollo/react-hooks";
import { SAVE_BOOK } from "../utils/mutations";
import { GET_ME } from "../utils/queries";
import { useHistory } from "react-router-dom";

const SearchBooks = () => {

  const [searchedBooks, setSearchedBooks] = useState([]);
  
  const [searchInput, setSearchInput] = useState("");

  const [bookids, setbookids] = useState(getSavedBookIds());
  const navigate = useHistory();
 
  const [saveBook] = useMutation(SAVE_BOOK);
  useEffect(() => {
    return () => saveBookIds(bookids);
  });
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error("something went wrong!");
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        link: book.volumeInfo.infoLink,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));

      setSearchedBooks(bookData);
      setSearchInput("");
      window.scrollTo(1000, 1000);
    } catch (err) {
      console.error(err);
    }
  };


  const handleSaveBook = async (bookId) => {
    
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

  
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await saveBook({
        variables: { book: bookToSave },
        update: (cache) => {
          const { me } = cache.readQuery({ query: GET_ME });
       
          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...me, savedBooks: [...me.savedBooks, bookToSave] } },
          });
        },
      });

      
      setbookids([...bookids, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        style={{
          height: "50vh",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle, rgba(37,68,12,1) 0%, rgba(29,41,18,1) 45%, rgba(11,11,11,1) 98%)",
          color: "white",
        }}
      >
        <h2>Search Book Engine</h2>
        <input
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "10px",
            background: "white",
            borderRadius: "50px",
          }}
          placeholder="Search for a book"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          style={{
            background: "#fff",
            padding: "10px 30px",
            borderRadius: "5px",
            border: "none",
            color: "black",
          }}
          onClick={handleFormSubmit}
        >
          Search
        </button>
      </div>

      <div id="result" style={{ margin: "50px 0px" }}>
        <p>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </p>
        <div
          style={{
            width: "100%",
            display: "flex",

            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {searchedBooks.map((book, i) => {
            return (
          
              <div
                key={i}
                style={{
                  width: "400px",
                  background:
                    "radial-gradient(circle, rgba(37,68,12,1) 0%, rgba(29,41,18,1) 45%, rgba(11,11,11,1) 98%)",
                  color: "white",
                  padding: "30px",
                }}
              >
                <div style={{ height: "200px", width: "100%" }}>
                  <img
                    src={book?.image}
                    style={{ width: "100%", height: "200px" }}
                  />
                </div>
                <p>{book?.title}</p>
                <p>Author {book?.authors}</p>
                <p
                  style={{
                   
                  }}
                >
                  {book.description}
                </p>
                 {Auth.loggedIn() && (
                    <Button
                      disabled={bookids?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {bookids?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )
                        ? "This book has been saved!"
                        : "Save this Book!"}
                    </Button>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SearchBooks;
