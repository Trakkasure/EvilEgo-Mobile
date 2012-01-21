UserModel = Backbone.Model.extend({
    defaults: {
        user: ''
      , password: ''
      , save: false
    }
  , initialize: function(defaults) {
        _.bindAll(this,'authenticate','url')
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
    }
  , authenticate: function() {
        var d = $.Deferred()
        if ('' == this.get('login')) return d.fail('No login name')
        return $.ajax({
            url: this.url()+'/authenticate'
          , type: "POST"
          , data: "password="+this.get('password')
        })
    }
  , url: function() {
        return EvilEgo.dataHost+'/user/'+this.get('login')
    }
})
