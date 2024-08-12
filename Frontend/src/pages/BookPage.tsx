import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { book } from "../interfaces/BookInterface";
import { SearchBar } from "../components/Global/SearchBar";
import '../styles/book-page.css';
import { LoadingIcon } from "../components/Global/LoadingIcon";
import { fetchSimilarBooks } from "../services/similarBookSearch";
import { SimilarBook } from "../components/Book-Page/SimilarBook";
import { Author } from "../interfaces/AuthorInterface";
import { fetchAuthorDetails } from "../services/authorSearch";
import { RightArrowIcon } from "../components/Global/RightArrowIcon";
import { sliceDescription } from "../utils/sliceDescription";

type Loading = {
    aboutAuthor: boolean
    similarBooks: boolean
}

type customError = {
    aboutAuthor: boolean
    similarBooks: boolean
}

type showMoreButton = {
    aboutAuthor: boolean
    bookDescription: boolean
}

export const BookPage: React.FC = () => {

    const location = useLocation();
    const book: book | undefined = location.state.bookData;

        // states
        const [aboutAuthor, setAboutAuthor] = useState<Author>({
            description: '',
            image_url: ''
        });
        const [loading, setLoading] = useState<Loading>({
            aboutAuthor: false,
            similarBooks: false
        });
        const [error, setError] = useState<customError>({
            aboutAuthor: false,
            similarBooks: false
        });
        const [showMoreButtonClicked, setShowMoreButtonClicked] = useState<showMoreButton>({
            aboutAuthor: false,
            bookDescription: false
        });
        const [similarBooks, setSimilarBooks] = useState<Array<book>>([]);
        const [similarBooksHistory, setSimilarBooksHistory] = useState<Array<Array<book>>>([]);
        const [bookDescription, setBookDescription] = useState<string>('');

        // refs 
        const fullAuthorDescriptionRef = useRef<string>('');
        const similarBooksCacheRef = useRef<Array<book>>([]);       // dynamic cache for similar books that is added to and removed from
        const allSimilarBooksRef = useRef<Array<book>>([]);

        // effects
        // fetches description about the author of the book
        useEffect(() => {
            const fetchDescription = async () => {
                try {
                    if (book) {
                        const storedAuthorDetails = sessionStorage.getItem(`author-${book.authors[0]}`);
                        if (storedAuthorDetails) {
                            const parsedDetails: Author = JSON.parse(storedAuthorDetails);
                            const storedDescription = parsedDetails.description;
                            const storedImage = parsedDetails.image_url;
                            fullAuthorDescriptionRef.current = storedDescription;
                            setAboutAuthor(prevState => ({
                                ...prevState,
                                'description': sliceDescription(storedDescription),
                                'image_url': storedImage
                            }));
                        } 
                        else {
                            setLoading(prevState => ({
                                ...prevState,
                                aboutAuthor: true
                            }));
                            const authorDetails: Author | null = await fetchAuthorDetails(book.authors[0]);

                            // if fetching author details did not return empty, we get the description
                            if (authorDetails) {
                                const authorDescription = authorDetails.description;
                                const image_url = authorDetails.image_url;
                                fullAuthorDescriptionRef.current = authorDescription;

                                setAboutAuthor(prevState => ({
                                    ...prevState,
                                    description: sliceDescription(authorDescription),
                                    image_url: image_url
                                }));
                                sessionStorage.setItem(`author-${book.authors[0]}`, JSON.stringify({
                                    'description': authorDescription,
                                    'image_url': image_url
                                }));
                            }
                        }
                    }
                } 
                catch (error) {
                    setError(prevState => ({
                        ...prevState,
                        aboutAuthor: true
                    }));
                } 
                finally {
                    setLoading(prevState => ({
                        ...prevState,
                        aboutAuthor: false
                    }));
                }
            };
    
        fetchDescription();
        
        return () => {
            setAboutAuthor(prevState => ({
                ...prevState,
                'description': '',
                'image_url': ''
            }));
        };
    }, [book]);

    // fetches a specified number of similar books 
    useEffect(() => {
        const getSimilarBooks = async () => {
            if (book) {
                try {
                    if (sessionStorage.getItem(`${book.title}-similar-books`)) {
                        const storedSimilarBooks = sessionStorage.getItem(`${book.title}-similar-books`);
                        if (storedSimilarBooks) {
                            const similarBooks: Array<book> = JSON.parse(storedSimilarBooks);
                            allSimilarBooksRef.current = similarBooks;
                            similarBooksCacheRef.current = similarBooks;

                            const newSimilarBooks = similarBooksCacheRef.current.slice(-5);

                            // updating history
                            setSimilarBooksHistory([newSimilarBooks]);
                            setSimilarBooks(newSimilarBooks);
                            similarBooksCacheRef.current.splice(-5);
                        }
                    }
                    else {
                        setLoading(prevState => ({
                            ...prevState,
                            similarBooks: true
                        }));
                        const similarBooks: Array<book> | null = await fetchSimilarBooks(book.title, 20);
                        if (similarBooks && similarBooks.length > 0) {
                            allSimilarBooksRef.current = similarBooks;
                            similarBooksCacheRef.current = similarBooks;

                            const newSimilarBooks = similarBooksCacheRef.current.slice(0, 5);
                            
                            // updating history
                            setSimilarBooksHistory([newSimilarBooks]);

                            setSimilarBooks(newSimilarBooks);

                            // saving full cache to storage and removing the retrieved books 
                            sessionStorage.setItem(`${book.title}-similar-books`, JSON.stringify(similarBooksCacheRef.current));
                            similarBooksCacheRef.current.splice(0, 5);
                        }
                    }
                }   
                catch {
                    setError(prevState => ({
                        ...prevState,
                        similarBooks: true
                    }));
                }
                finally {
                    setLoading(prevState => ({
                        ...prevState,
                        similarBooks: false
                    }));
                }
            }
        }
        getSimilarBooks();
        return () => {
            setSimilarBooks([]);
            setSimilarBooksHistory([]);
        }
    }, [book]);


    useEffect(() => {
        if (book) {
            setBookDescription(sliceDescription(book.description));
        }

        return () => {
            setBookDescription('');
        }
    }, [book]);
    

    // functions

    // handles the show more button of book and author descriptions
    const handleShowMore = (descriptionType: string) => {
        if (descriptionType.toLowerCase().replace('/\s+/g', '') === 'aboutauthor') {
            setAboutAuthor(prevState => ({
                ...prevState,
                'description': fullAuthorDescriptionRef.current
            }));
            setShowMoreButtonClicked(prevState => ({
                ...prevState,
                aboutAuthor: true
            }));
        }
        else if (descriptionType.toLowerCase().replace('/\s+/g', '') === 'bookdescription') {
            if (book) {
                setBookDescription(book.description);
                setShowMoreButtonClicked(prevState => ({
                    ...prevState, 
                    bookDescription: true
                }));  
            }
        }
        else {
            console.log("Parameter given to handleShowMore function must either be 'about author' or 'book description'.");
        }
    }

    // handles the show less button of book and author descriptions
    const handleShowLess = (descriptionType: string) => {
        if (descriptionType.toLowerCase().replace('/\s+/g', '') === 'aboutauthor') {
            const currentDescription = aboutAuthor.description;
            const slicedDescription = sliceDescription(currentDescription);
            setAboutAuthor(prevState => ({
                ...prevState,
                'description': slicedDescription
            }));
            setShowMoreButtonClicked(prevState => ({
                ...prevState,
                aboutAuthor: false
            }));
        }
        else if (descriptionType.toLowerCase().replace('/\s+/g', '') === 'bookdescription') {
            if (book) {
                setBookDescription(sliceDescription(bookDescription));
                setShowMoreButtonClicked(prevState => ({
                    ...prevState, 
                    bookDescription: false
                }));           
            } 
        }
        else {
            console.log("Parameter given to handleShowLess function must either be 'about author' or 'book description'.");
        }
    }

    // gets the last 5 similar books from the history
    const handleLeftArrowClick = () => {
        if (similarBooksHistory.length > 0) {
            // updating history
            const newHistory = similarBooksHistory.slice(0, -1);

            if (newHistory.length > 0) {
                // sending back current similar books to the cache
                similarBooksCacheRef.current.unshift(...similarBooks);
                const lastSimilarBooks = newHistory[newHistory.length-1];
                setSimilarBooks(lastSimilarBooks);
                setSimilarBooksHistory(newHistory);
            }
        }
    }

    // gets the last 5 similar books from the cache
    const handleRightArrowClick = () => {
        if (similarBooksCacheRef.current.length > 0) {
            const newSimilarBooks = similarBooksCacheRef.current.slice(0, 5);
            setSimilarBooksHistory(prevHistory => [...prevHistory, newSimilarBooks]);
            setSimilarBooks(newSimilarBooks);
            similarBooksCacheRef.current.splice(0, 5);
        }
    }

    const renderAllSimilarBooks = () => {

    }

    
    if (!book) {
        return (
            <div>Book Not Found.</div>
        );
    }

    return (
        <div className="book-page-container">
            <SearchBar />
            <div className="book-page-main">
                <div className="book-page-left-column">
                    <img className="book-page-book-cover" src={book.image_url} alt="Book cover" />
                    <button className="reading-status-btn">Want to read</button>
                    <button className="buy-amazon-btn">Buy on Amazon</button>
                </div>
                <div className="book-page-main-content">
                    <div className="book-page-title-section">
                        <h1 className="book-title-header">{book.title}</h1>
                    </div>
                    <div className="book-page-metadata-section">
                        <div className="book-page-authors">
                            {book.authors.map((author, index) => 
                                <h3 className="book-page-author" key={author}>{index > 0 && ', '}{author}</h3>
                            )}
                        </div>
                            { bookDescription &&
                                <div className="book-page-description">
                                    { bookDescription.length < book.description.length ?
                                        <>
                                            <p className= "description-faded" >
                                                {bookDescription}
                                            </p>

                                            <button className="show-more-btn" onClick={() => handleShowMore('bookDescription')}>Show more</button>
                                            <svg className="arrow-down-icon" height='10' width='10' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" onClick={() => handleShowMore('bookDescription')} >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                                            </svg>
                                        </>
                                        :
                                        <>
                                            <p className= "description" >
                                                {bookDescription}
                                            </p>
                                            {
                                                showMoreButtonClicked.bookDescription &&
                                                <>
                                                    <button className="show-more-btn" onClick={() => handleShowLess('bookDescription')}>Show less</button>
                                                    <svg className="arrow-down-icon" height='10' width='10' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" onClick={() => handleShowLess('bookDescription')} >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                                                    </svg>
                                                </>
                                            }
                                        </>
                                    }
                                </div>
                            }                        
                        {book.categories.length > 0 &&
                            <div className="book-page-genres">
                                <p>Genres:</p> 
                                {book.categories.map(category =>
                                    <p className="book-page-genre" key={category}>{category}</p>
                                )}
                            </div>
                        }
                        <div className="edition-details">
                            <p className="edition-details-title">This edition</p>
                            <p className="page-count">Page count: {book.pageCount}</p>
                            <p className="published">Published {book.publishedDate} by {book.publisher}</p>
                            <p className="language">Language: {book.language === 'en' ? 'English' : `${book.language}`}</p>
                        </div>
                        <div className="about-author-container">
                            <hr className="about-author-divider" />
                            <p className="about-author-header">
                                About the author
                            </p>
                            {
                                loading.aboutAuthor ? 
                                    <div className="loading-about-author">
                                        <p>Loading</p>
                                        <LoadingIcon />
                                    </div>
                                : 
                                error.aboutAuthor ?
                                    <div className="about-author-error">
                                        <p className="about-author-error-message">Failed to fetch author's description. Please refresh to try again.</p>
                                    </div>
                                :
                                <div>
                                    {aboutAuthor.image_url &&
                                        <div className="book-page-author-details">
                                            <img className="book-page-author-picture" src={aboutAuthor.image_url} alt="Author's image" />
                                            <p className="book-page-author-name">{book.authors[0]}</p>
                                        </div>
                                    }
                                    {
                                        aboutAuthor.description.length < fullAuthorDescriptionRef.current.length ?
                                        <>
                                            <p className= "description-faded" >
                                                {aboutAuthor.description}
                                            </p>

                                            <button className="show-more-btn" onClick={() => handleShowMore('aboutAuthor')}>Show more</button>
                                            <svg className="arrow-down-icon" height='10' width='10' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                                            </svg>
                                        </>
                                        :
                                        <>
                                            <p className= "description" >
                                                {aboutAuthor.description}
                                            </p>
                                            {
                                                showMoreButtonClicked.aboutAuthor &&
                                                <>
                                                    <button className="show-more-btn" onClick={() => handleShowLess('aboutAuthor')}>Show less</button>
                                                    <svg className="arrow-down-icon" height='10' width='10' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                                                    </svg>
                                                </>
                                            }
                                        </>
                                    }
                                    <hr className="about-author-divider"/>
                                </div>
                            }

                            <div className="similar-books-container">
                                <div className="similar-books-header-div">
                                    <p className="similar-books-header">
                                        Readers also enjoyed
                                    </p>
                                </div>
                                {
                                    // request to fetch similar books in progress
                                    loading.similarBooks ? 
                                        <div className="loading-similar-books">
                                            <p>Loading</p>
                                            <LoadingIcon />
                                        </div>
                                    :
                                    // request to fetch similar books unexpectedly fails
                                    error.similarBooks ? 
                                        <div className="similar-books-error">
                                            <p className="about-author-error-message">Failed to fetch similar books. Please refresh to try again.</p>
                                        </div>
                                    :
                                    <div className="similar-books">
                                        {
                                            // attempting to fetch similar books successful but might return nothing if no books found
                                            similarBooks.length > 0 ?
                                                similarBooks.map((book, index) => 
                                                    index < 5 && <SimilarBook key={book.id} book={book} isLast={index === similarBooks.length-1} handleLeftArrowClick={handleLeftArrowClick} handleRightArrowClick={handleRightArrowClick} />
                                                )
                                            :
                                            <div className="no-similar-books-found">No similar books could be found for {book.title}</div>
                                        }
                                    </div>   
                                }
                                <Link to={`/similar-books/${book.id}`} state={ { originalBook: book, similarBooks: allSimilarBooksRef.current } }>
                                    <div className="all-similar-books-btn-container">
                                        <button className="all-similar-books-btn">All similar books</button>
                                        <RightArrowIcon height="20" width="20" className="all-similar-books-btn-svg" />
                                    </div>
                                </Link>
                            </div>
                            <hr className="similar-books-divider" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

