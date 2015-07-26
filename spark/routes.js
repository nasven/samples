var get = Spark.get;
var post = Spark.post;
var random = new java.util.Random();

stop();

get("/process", function(req, res) {
  return process(req, res);
});

get("/json", "application/json", function(req,res) {
  var date = java.util.Calendar.getInstance().getTime();
  var obj = {"name":"Nasven.js", "date":"${date}"};
  return obj;
}, function(model) JSON.stringify(model));

// Creates a new book resource, will return the ID to the created resource
// author and title are sent as query parameters e.g. /books?author=Foo&title=Bar
post("/books", function(request, response) {
            var author = request.queryParams("author");
            var title = request.queryParams("title");
            var book = {"author":"${author}", "title":"${title}"};

            var id = random.nextInt(999999);
            books.put(id.toString(), book);

            response.status(201); // 201 Created
            return id;
});

// Gets all available book resources (id's)
get("/books", function(request, response) {
            var ids = "";
            for each (var id in books.keySet()) {
                ids += id + " ";
            }
            return ids;
});

// Gets the book resource for the provided id
get("/books/:id", function(request, response) {
    var book = books.get(request.params(":id"));
    if (book != null) {
        return JSON.stringify(book);
            } else {
                response.status(404); // 404 Not found
                return "Book not found";
            }
        });
