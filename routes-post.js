var PostRoutes = new Backbone.Router.extend({

      routes: {
        "post/:post_id"             :"getPost",
        "post/search/:query"        :"search",  // #search/kiwis
        "posts/:user_id"            :'newsfeed'
      },

      getPost: function(post_id) {
          var post = new PostModel({_id: post_id})
          post.fetch()
          var postView = new PostView({model: post})
          $('#postList').children().remove()
          $('#postList').append(postView.render())
      },

      newsfeed: function(query) {
         if (!EvilEgo.loggedInUser) return
         EvilEgo.loggedInUser.getNewsFeed()
      }

      search: function(query) {
      }

});

