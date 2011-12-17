var PlayerModel = Backbone.Model.extend({
    initialize : function(defaults) {
        console.log("init model: player")
        if (defaults && 'object' === typeof(defaults)) this.set(defaults)
        _.bindAll(this,'getNewsFeed','url')
    }
  , getNewsFeed: function() {
        EvilEgo.collection.newsFeed = (new PostCollection).fetchPosts(this.login)
    }
  , url: function() {
        return EvilEgo.dataHost+'/user/'+this.get('login')
    }
})

var Players = Backbone.Collection.extend({
    model: PlayerModel
})
