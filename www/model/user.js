UserModel = Backbone.Model.extend({
    initialize: function(defaults) {
        console.log("init model: user")
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
    }
  , authenticate: function(success,fail) {
        var deferred = $.Deferred().done(success).fail(fail)
        if ('' == this.get('login')) return deferred.rejectWith(this,'No login name')

        $.ajax({
            url: this.url()+'/authenticate'
          , type: "POST"
          , data: "password="+this.get('password')
          , success: function(data) {
              if (data.success)
                deferred.resolveWith(self,data.data)
              else deferred.rejectWith(self,data.error||'An error occurred')
            }
          , failed: function() {deferred.rejectWith(self,'An error occurred')}
        })
    }
  , url: function() {
        return '/user/'+this.get('login')
    }
  , getNewsFeed: function() {
        EvilEgo.collection.newsFeed = new PostCollection('newsfeed')
    }
})
