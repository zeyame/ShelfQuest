import React from 'react';
import ReactDOM from 'react-dom/client';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';
import { SearchPage } from './pages/explore/SearchPage';
import { TrendingBooksPage } from './pages/explore/TrendingBooksPage';
import { PopularAuthorsPage } from './pages/explore/PopularAuthorsPage';
import { AddBookPage } from './pages/explore/AddBookPage';
import { ReadPage } from './pages/library/ReadPage';
import { ToReadPage } from './pages/library/ToReadPage';
import { ReadingPage } from './pages/library/ReadingPage';
import { GoalsPage } from './pages/activity/GoalsPage';
import { StatsPage } from './pages/activity/StatsPage';
import './styles/index.css';
import {App} from './App';
import { ErrorPage } from './pages/ErrorPage';
import { BookPage } from './pages/sub-pages/BookPage';
import { AllSimilarBooksPage } from './pages/sub-pages/AllSimilarBooksPage';
import { AboutAuthor } from './components/Book-Page/AboutAuthor';
import { AuthorPage } from './pages/sub-pages/AuthorPage';
import { LoginPage } from './pages/account/LoginPage';
import { RegistrationPage } from './pages/account/RegistrationPage';
import { VerificationPage } from './pages/account/VerificationPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <SearchPage />
      },
      {
        path: '/trending-books',
        element: <TrendingBooksPage />
      },
      {
        path: '/popular-authors',
        element: <PopularAuthorsPage />
      },
      {
        path: '/add-book',
        element: <AddBookPage />
      },
      {
        path: '/read',
        element: <ReadPage />
      },
      {
        path: '/reading',
        element: <ReadingPage />
      },
      {
        path: '/to-read',
        element: <ToReadPage />
      },
      {
        path: '/goals',
        element: <GoalsPage />
      },
      {
        path: '/stats',
        element: <StatsPage />
      },
      {
        path: '/book/:bookId',
        element: <BookPage />
      },
      {
        path: '/similar-books/:bookId',
        element: <AllSimilarBooksPage />
      },
      {
        path: '/author/:authorName',
        element: <AuthorPage />
      },
      {
        path: '/user/login',
        element: <LoginPage />
      },
      {
        path: '/user/registration',
        element: <RegistrationPage />
      },
      {
        path: '/user/verification',
        element: <VerificationPage />
      }
    ],
    errorElement: <ErrorPage />
  },  
]);

const element = document.getElementById('root') as HTMLElement;

if (element) {
  const root = ReactDOM.createRoot(element);
  root.render(
      <RouterProvider router={router} />
  );  
}
else {
  console.error('Root element not found');
}
