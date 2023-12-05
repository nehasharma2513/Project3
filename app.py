# Import the dependencies.
from pymongo import MongoClient
from flask import Flask, jsonify, render_template

#################################################
# Database Setup
#################################################

# Create an instance of MongoClient
client = MongoClient('localhost', 27017)
db = client.books_db
books_collection=db['books']
reviews_collection=db['ratings']
users_collection=db['users']
#################################################
# Flask Setup
#################################################
app=Flask(__name__)

# #################################################
# # Flask Routes
# #################################################

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/v1.0/books")
def get_books():
     books_data_cursor=books_collection.find({}, {'_id': 0})
     books_data = [book for book in books_data_cursor]
     return jsonify(books_data)

@app.route("/api/v1.0/users")
def get_users():
     users_data_cursor = users_collection.find({}, {'_id': 0})
     users_data = [user for user in users_data_cursor]
     return jsonify(users_data)

@app.route("/api/v1.0/reviews")
def get_reviews():
     reviews_data_cursor=reviews_collection.find({},{'_id': 0})
     reviews_data = [reviews for reviews in reviews_data_cursor]
     return jsonify(reviews_data)

if __name__== "__main__":
    app.run(debug=True)