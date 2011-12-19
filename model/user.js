console.log('model/user.js')

UserModel = Backbone.Model.extend({
    defaults: {
        user: ''
      , password: ''
    }
  , initialize: function(defaults) {
        console.log("init model: user")
        _.bindAll(this,'authenticate','url')
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
    }
  , authenticate: function(success,fail) {
        if ('' == this.get('login')) return fail('No login name')
        console.log('Authenticating: '+this.get('login'))
        $.ajax({
            url: this.url()+'/authenticate'
          , type: "POST"
          , data: "password="+this.get('password')
          , success: function(data) {
              success(new PlayerModel(data))
            }
          , error: function(res) {
              fail(res.responseText)
          }
        })
    }
  , url: function() {
        return EvilEgo.dataHost+'/user/'+this.get('login')
    }
})
