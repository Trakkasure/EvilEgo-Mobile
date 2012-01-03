var PostRoutes = Backbone.Router.extend({

    routes: {
        "post/:post_id"             :"getPost"
      , "post/new"                  :"newPost"
      , "post/search/:query"        :"search"
      , "posts/:user_id"            :"newsfeed"
      , "newsfeed"                  :"newsfeed"
      , "*actions"                  :"defaultHandler"
    }
  , getPost: function(post_id) {
        var post = new PostModel({_id: post_id})
        post.fetch()
        var postView = new PostView({model: post})
        $('#postList').empty()
        $('#postList').append(postView.render())
    }
  , newsfeed: function(query) {
       if (!EvilEgo.loggedInUser) return
       EvilEgo.loggedInUser.getNewsFeed()
    }
  , newPost: function() {
       console.log('New Post router')
       var pfv = new PostFormView(new PostModel({owner:EvilEgo.currentUser.login}))
       pfv.render()
    }
  , search: function(query) {
    }
  , defaultHandler: function(action) {
      console.log('Default route handler')
      console.log(action)
    }

});
PostRouter = new PostRoutes
