import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      bookCount
    }
  }`

const ALL_BOOKS = gql`
  {
    allBooks {
      title
      published
      author { name }
    }
  }`

const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title
      published
      author { name }
    }
  }`

const SET_BIRTHYEAR = gql`
  mutation setBirthyear($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
      bookCount
      id
    }
  }`

  const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
      login(username: $username, password: $password)  {
        value
      }
    }
  `

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)

  const handleError = (error) => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const client = useApolloClient()

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)

  const [addBook] = useMutation(CREATE_BOOK, 
    {
      onError: handleError,
      refetchQueries: [{ query: ALL_BOOKS },{ query: ALL_AUTHORS}]
    })

  const [addBorn] = useMutation(SET_BIRTHYEAR,
    {
      onError: handleError,
      refetchQueries: [{ query: ALL_AUTHORS }]
    })
  
  const [login] = useMutation(LOGIN, {
      onError: handleError
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token 
          ? <div>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={logout}>logout</button>
          </div>
          : <button onClick={() => setPage('login')}>login</button>
        }
      </div>

      {errorMessage &&
        <div style={{ color: 'red' }}>
          {errorMessage}
        </div>
      }

      <Authors 
        show={page === 'authors'}
        result={authors}
        addBorn={addBorn}
      />

      <Books
        show={page === 'books'}
        result={books}
      />

      <NewBook
        addBook={addBook}
        show={page === 'add'}
      />

      <LoginForm
        show={page === 'login'}
        login={login}
        setToken={(token) => setToken(token)}
      />

    </div>
  )
}

export default App