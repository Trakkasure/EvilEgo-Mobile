PlayerModel =  Backbone.Model.extend({
    defaults: {
        user: ''
      , password: ''
      , save: false
    }
  , initialize: function(defaults) {
        _.bindAll(this,'url', 'getNewsFeed')
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
    }
  , getNewsFeed: function() {
        EvilEgo.collection.newsFeed = (new PostCollection).fetchPosts(this.login)
    }
  , url: function() {
        return EvilEgo.dataHost+'/user/'+this.get('login')
    }
})
