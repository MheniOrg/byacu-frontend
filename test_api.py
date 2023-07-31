from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.oauth2.credentials
import google_auth_oauthlib.flow
from starlette.responses import RedirectResponse

app = FastAPI()

import os 
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

CLIENT_CONFIG = {"web":{"client_id":"459053921819-1obhcifjbb5ct1cppp8b57fvigpfrbfj.apps.googleusercontent.com","project_id":"byacu-388302","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["https://byacu.com:8000/oauth_callback","http://localhost:4200/","http://localhost:4200/dashboard"],"javascript_origins":["https://byacu.com:8000","https://localhost:4200"]}}

# CORS settings
origins = ["*"]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Sample data
class Book(BaseModel):
    id: int
    title: str
    author: str

books = [
    Book(id=1, title="Book 1", author="Author 1"),
    Book(id=2, title="Book 2", author="Author 2"),
    Book(id=3, title="Book 3", author="Author 3")
]

# GET /books
@app.get('/books')
def get_books():
    return books


@app.get('/auth/{page}')
def auth(page: str):

    # print(dir(google_auth_oauthlib.flow.Flow))

    # Use the client_secret.json file to identify the application requesting
    # authorization. The client ID (from that file) and access scopes are required.
    flow = google_auth_oauthlib.flow.Flow.from_client_config(
        client_config=CLIENT_CONFIG,
        state=page,
        scopes=['https://www.googleapis.com/auth/youtube.force-ssl'])

    # Indicate where the API server will redirect the user after the user completes
    # the authorization flow. The redirect URI is required. The value must exactly
    # match one of the authorized redirect URIs for the OAuth 2.0 client, which you
    # configured in the API Console. If this value doesn't match an authorized URI,
    # you will get a 'redirect_uri_mismatch' error.
    flow.redirect_uri = 'http://localhost:8000/oauth_callback'

    # Generate URL for request to Google's OAuth 2.0 server.
    # Use kwargs to set optional request parameters.
    authorization_url, state = flow.authorization_url(
        # Enable offline access so that you can refresh an access token without
        # re-prompting the user for permission. Recommended for web server apps.
        access_type='offline',
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true')

    return authorization_url

@app.get('/oauth_callback')
def oauth_callback(request: Request):
    params = dict(request.query_params)

    print(params)

    flow = google_auth_oauthlib.flow.Flow.from_client_config(
        client_config=CLIENT_CONFIG,
        # state=page,
        scopes=['https://www.googleapis.com/auth/youtube.force-ssl'])
    flow.redirect_uri = 'http://localhost:8000/oauth_callback'

    try: 
        flow.fetch_token(code=params['code'])
        refresh_token = flow.credentials.refresh_token
        token = flow.credentials.token


        url = f'http://localhost:4200/{params["state"]}#access_token={token}'

        response = RedirectResponse(url=url)

    except Exception as e:
        print(e)

        response = "failed"

    
    return response


# GET /books/{book_id}
@app.get('/books/{book_id}')
def get_book(book_id: int):
    book = next((book for book in books if book.id == book_id), None)
    if book:
        return book
    return {"message": "Book not found"}

# POST /books
@app.post('/books')
def add_book(book: Book):
    books.append(book)
    return book

# PUT /books/{book_id}
@app.put('/books/{book_id}')
def update_book(book_id: int, updated_book: Book):
    book = next((book for book in books if book.id == book_id), None)
    if book:
        book.title = updated_book.title
        book.author = updated_book.author
        return book
    return {"message": "Book not found"}

# DELETE /books/{book_id}
@app.delete('/books/{book_id}')
def delete_book(book_id: int):
    book = next((book for book in books if book.id == book_id), None)
    if book:
        books.remove(book)
        return {"message": "Book deleted"}
    return {"message": "Book not found"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
