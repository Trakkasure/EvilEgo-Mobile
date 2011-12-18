UserView = Backbone.View.extend({

})

LoginView = new (Backbone.View.extend({
    el: $('#loginForm')

  , events: {
        'click #loginSubmit': 'authenticate'
      , 'change #login'     : 'setLogin'
      , 'change #password'  : 'setPassword'
    }

  , initialize: function() {
        console.log('Init LoginView')
        _.bindAll(this,'authenticate','setLogin','setPassword')
        this.model.bind('change:login',function(v){$('#login').val(v.login)})
    }
  , authenticate: function() {
        console.log('Authenticating')
        this.model.authenticate(function(o_player) {
            console.log('Success')
            EvilEgo.currentUser  = o_player.login
            EvilEgo.loggedInUser = o_player
            if (window.localStorage) {
                window.localStorage.setItem('lastLogin',EvilEgo.currentUser)
                window.localStorage.setItem(EvilEgo.currentUser,EvilEgo.loggedInUser)
            }
            var pc = EvilEgo.collections.PostCollection = new PostCollection('newsfeed')
            pc.fetchPosts(o_player.get('login'))
            var pv = new PostListView(pc)
            //pv.render()
        }, function(error) {
            $('.error', this.el).html(error||'An error occrued while communicating with the server')
        })
    }
  , setLogin: function(e)  {
        //console.log('Setting login: %s',e.target.value))
        this.model.set({'login':e.currentTarget.value})
    }
  , setPassword: function(e)  {
        this.model.set({'password':e.currentTarget.value})
    }
}))({model: new UserModel({login:EvilEgo.currentUser})})

