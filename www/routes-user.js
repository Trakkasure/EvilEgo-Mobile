var UserRoutes = new Backbone.Router.extend({

    routes: {
        "user/login"                :"login"
      , "user/search/:query"        :"search"  // #search/kiwis
      , "user/newsfeed"             :'newsfeed'
    }

  , login: function() {
        var fields = $('#loginForm form').serializeArray()
        var model = {}
        _(fields).each(function(item) {
            model[item.name]=item.value
        })
        var user = new UserModel(model)
        user.authenticate(function(o_player) {
            user.set(o_player)
            EvilEgo.loggedInUser = user
            $('#loginForm').hide()
            window.location.hash = "#user/newsfeed"
        }, function(err) {
            $("#loginForm div.error").html(err||"Error logging in.")
        })
    }

  , newsfeed: function(query) {
        if (!EvilEgo.loggedInUser) return
        EvilEgo.loggedInUser.getNewsFeed()
    }

  , search: function(query) {
    }

});

