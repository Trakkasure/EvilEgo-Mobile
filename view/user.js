console.log('view/user.js')

UserView = Backbone.View.extend({

})

lfd = getTemplate('templates/loginForm.html','loginFormTemplate')

LoginView = Backbone.View.extend({
    el: $('#loginContainer')

  , events: {
        'click #loginSubmit': 'authenticate'
      , 'change #loginName' : 'setLogin'
      , 'change #password'  : 'setPassword'
      , 'change #save    '  : 'setSave'
    }

  , initialize: function() {
        _.bindAll(this,'authenticate','setLogin','setPassword','setSave','render')
        this.template = $('#loginFormTemplate').html()
        console.log('Init LoginView')
        this.render()
        this.model.bind('change:login',function(o,val){
            console.log(o.get('login')+':'+val)
            if (o.get('login')!=val)
                $('#loginName').val(val)
        })
        window.location.hash = "login"
    }
  , render: function() {
        $(this.el).html($.tmpl(this.template,this.model.toJSON())).trigger('create')
    }
  , authenticate: function() {
        var self = this
        this.model.authenticate(function(o_player) {
            EvilEgo.currentUser  = o_player.get('login')
            EvilEgo.loggedInUser = o_player.toJSON()
            if (self.model.get('save') && window.localStorage) {
                console.log('Setting local storage')
                window.localStorage.setItem('lastLogin',JSON.stringify({login:EvilEgo.currentUser,password:self.model.get('password')}))
                window.localStorage.setItem(EvilEgo.currentUser,JSON.stringify(EvilEgo.loggedInUser))
            }
            var pc = EvilEgo.collections.PostCollection = new PostCollection('newsfeed')
            var pv = new PostListView(pc)
            pc.fetchPosts(o_player.get('login'))
            window.location.hash = 'newsfeed'
            //pv.render()
        }, function(error) {
            $('.error', this.el).html(error||'An error occrued while communicating with the server')
        })
    }
  , setLogin: function(e)  {
        console.log('Setting login: %s',e.currentTarget.value)
        this.model.set({'login':e.currentTarget.value})
    }
  , setPassword: function(e)  {
        this.model.set({'password':e.currentTarget.value})
    }
  , setSave: function(e)  {
        this.model.set({'save':e.currentTarget.checked})
    }
})

