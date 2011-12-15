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
    }
  , authenticate: function() {
        console.log('Authenticating')
        this.model.authenticate(function(o_player) {
            console.log('Success')
            EvilEgo.currentUser = o_player
        }, function(error) {
            $('.error', this.el).html(error)
        })
    }
  , setLogin: function(e)  {
        this.model.set('login',e.target.value)
    }
  , setPassword: function(e)  {
        this.model.set('password',e.target.value)
    }
}))({model: new UserModel()})

console.log('Login view')
console.log(LoginView)
