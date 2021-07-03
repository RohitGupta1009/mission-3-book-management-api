//Prefix : /books

//in express by default it provides us routers to implement the microservices

const Router=require("express").Router();       //initialzing Express Router



//DataBase Models:

const BookModel=require("../../database/book") ; // ../ -> goes back to API folder again ../ goes back to day 25 folder 



/* 
     Route         /books
     Description   get all books
     Access        PUBLIC
     Parameters    NONE
     Method        GET
*/     


Router.get("/",async(req,res)=>
{
    const getAllBooks=await BookModel.find();
  return  res.json(getAllBooks);
});



/* 
     Route         /books/by
     Description   get specific book based on ISBN
     Access        PUBLIC
     Parameters    isbn
     Method        GET
*/    


Router.get("/by/:isbn",async(req,res)=>
{
    const getSpecificBook=await BookModel.findOne({ISBN:req.params.isbn});
    if(!getSpecificBook)                                                                 /* if mongoDB didn't find any data it will return null not 0 so we can't use if(getSpecificBook.length===0) condition because we are writing findOne which means we are aiming for single object hence it won't be returned in array hence we can only use length condition if we write find(..) here we are not writing one so it WILL return array.*/  
    {
        return res.json({error:`No book found for ${req.params.isbn}`});
    }
    return res.json({book:getSpecificBook});
});




/* 
     Route         /books/c     (i.e  category)
     Description   To get a list of books based on category 
     Access        PUBLIC
     Parameters    category
     Method        GET
*/    


 Router.get("/c/:category",async(req,res)=>
 {
    const getSpecificBooks= await BookModel.find({category:req.params.category});
    if(getSpecificBooks.length===0)
    {
        return res.json({error:`No book found for ${req.params.category}`});
    }
    return res.json({book:getSpecificBooks});
 });


 /* 
     Route         /books/by/the
     Description   to get a list of books based on author
     Access        PUBLIC
     Parameters    authers
     Method        GET
*/    



Router.get("/by/the/:authors",async(req,res)=>
{
    const getBooksByAuthor=await BookModel.find({authors:req.params.authors})

    if(getBooksByAuthor.length===0)
    {
        return res.json({error: `No books based on the author id :${req.params.authors} is found`});
    }
    return res.json({by_author:getBooksByAuthor});
});




//2) POST Method:

/* 
     Route         /books/post/book/new
     Description   to upload a new book     
     Access        PUBLIC
     Parameters    None
     Method        POST
*/   

Router.post("/post/book/new",async(req,res)=>
{
    const {newBook} = req.body;                                                                // Destructuring

    const addNewBook= BookModel.create(newBook);

    return res.json({message:"book was added!"});
});




//3)PUT Method:



/* 
     Route         /books/update                                                               //be specific to avoid clashing
     Description   to update basic book details like title    
     Access        PUBLIC
     Parameters    isbn
     Method        PUT
*/ 




Router.put("/update/:isbn",async(req,res)=>
{

    const updatedBook=await BookModel.findOneAndUpdate(
        {
            ISBN:req.params.isbn,
        },
        {
            title:req.body.bookTitle,
        },

        {
            new:true,                                                                         // as we will get old data on postmon output so to see updated data 
        });

        return res.json({books:updatedBook});
});
    

    /*database.books.forEach((book)=>
    {
        if(book.ISBN===req.params.isbn)
        {
            book.title=req.body.bookTitle;
            return;
        }
    }); */
 





/* 
     Route         /books/author/update                                                     //be specific to avoid clashing
     Description   to update or add new author  
     Access        PUBLIC
     Parameters    isbn
     Method        PUT
*/ 




Router.put("/author/update/:isbn",async(req,res)=>
{
   //update the book database 

  const updatedBookAuthorData=await BookModel.findOneAndUpdate(
    {
        ISBN:req.params.isbn,
    },

    {
        $addToSet:{                                                                       // Here we are not using mongoDB $push operator but $addToSet as author id should be unique in this array to avoid repetition of authorid for arrays
            authors:req.body.aNewAuthor
        },
    },
    
    {
        new:true,
    }
  );




   //update the author database as well
   

   const updatedAuthorBookData=await AuthorModel.findOneAndUpdate(
    {
        id:req.body.aNewAuthor,
    },

    {
        $addToSet:{                                                                      //mongoDB push operator for arrays
            books:req.params.isbn,
        },
    },
    

    {
        new:true,
    },
  );
   
  
      
   return res.json({books:updatedBookAuthorData,authors:updatedAuthorBookData,message:"New author was added"});
  

});


/* 
     Route         /books/delete
     Description   to delete a book   
     Access        PUBLIC
     Parameters    isbn
     Method        DELETE                                                                // use filter(map method not forEach) in delete method as we want a new array in delete 
*/     




Router.delete("/delete/:isbn",async(req,res)=>
{
     const updatedBookDataBase = await BookModel.findOneAndDelete(
         {
           ISBN:req.params.isbn,    
         },
         
     );
     
     return res.json({books:updatedBookDataBase});
});




/* 
     Route         /books/delete/author
     Description   to delete an author from a book 
     Access        PUBLIC
     Parameters    isbn,authorId
     Method        DELETE
*/     


  

Router.delete("/delete/author/:isbn/:authorId",async(req,res)=>
{
    //update the book database


    const updatedBookData=await BookModel.findOneAndUpdate(
        {
            ISBN:req.params.isbn,
        },

        {
             $pull:
             {
                 authors:parseInt(req.params.authorId),
             },
        },

        {
            new:true                                                                     //as technically we are updating 
        },
        
    );

  

   //update the author database


    const updatedAuthorData=await AuthorModel.findOneAndUpdate(
        {
           id:parseInt(req.params.authorId),
        },
        {
            $pull:
            {
                books:req.params.isbn,
            },   
        },
        {
            new:true,
        }
    );
         
       return res.json({message:"Ahh you hate him;Author was deleted",books:updatedBookData,authors:updatedAuthorData})

});


module.exports=Router;