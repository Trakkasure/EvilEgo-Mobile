UserView = Backbone.View.extend({

})

lfd = getTemplate('templates/loginForm.html','loginFormTemplate')

LoginView = Backbone.View.extend({
    el: $('#loginContainer')

  , events: {
        'tap #loginSubmit'  : 'authenticate'
      , 'change #loginName' : 'setLogin'
      , 'change #password'  : 'setPassword'
      , 'change #save    '  : 'setSave'
    }

  , initialize: function() {
        _.bindAll(this,'authenticate','setLogin','setPassword','setSave','render')
        this.template = $('#loginFormTemplate').html()
        //console.log('Init LoginView')
        this.render()
        this.model.bind('change:login',function(o,val){
            //console.log(o.get('login')+':'+val)
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
        var networkTimer = null
        this.setPassword($('#password',this.el).val())
        $('.error', this.el).html('Network timeout while authenticating. Please try again');
        if (navigator.notificationEx) {
            navigator.notificationEx.loadingStart({labelText:'Logging in...'})//,duration:10})
        }
        var d = this.model.authenticate()
        networkTimer = setTimeout(d.fail,10000)
        d.done(function(data) {
            clearTimeout(networkTimer) // clear the network timeout timer.
            $('.error', this.el).empty()
            if (navigator.notificationEx) {
                navigator.notificationEx.loadingStop()
            }
            var o_player = new PlayerModel(data)
            //console.log('Current User:'+data.login)
            EvilEgo.currentUser  = data.login
            EvilEgo.loggedInUser = data
            if (self.model.get('save') && typeof (window.localStorage) != 'undefined') {
                window.localStorage.setItem('lastLogin',JSON.stringify({login:EvilEgo.currentUser,password:self.model.get('password')}))
                window.localStorage.setItem(EvilEgo.currentUser,JSON.stringify(EvilEgo.loggedInUser))
            }
            var pc = new PostCollection('newsfeed')
            var pv = new PostListView(pc)
            setTimeout(function() {
                pc.fetchPosts(o_player.get('login')).done(function() {
                    window.location.hash = 'newsfeed'
                })
            },50)
            //pv.render()
        }).error(function(error) {
            navigator.notificationEx.loadingStop()
            //console.log(JSON.stringify(error))
            $('.error', this.el).html((error&&error.description)||error||'An error occrued while communicating with the server')
        })
    }
  , setLogin: function(e)  {
        this.model.set({'login':e.currentTarget.value})
    }
  , setPassword: function(e)  {
        if (e && e.currentTarget)
            this.model.set({'password':e.currentTarget.value})
        else
            this.model.set({'password':e})
    }
  , setSave: function(e)  {
        this.model.set({'save':e.currentTarget.checked})
    }
})

