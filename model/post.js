PostModel = Backbone.Model.extend({
    defaults: {
        title: 'Default Title'
      , owner: 'Nobody'
      , post:  'This is an empty post'
      , isEmpty: true
    }
  , initialize: function(defaults) {
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
        var video = this.get('video')
          , images = this.get('images')
        // Used in the template to show/hide the point voting section
        this.set({
            canVote  : ((images && images.length) || (video && video.video_url))?1:0 // Used in the template to output a delete node to show when post swiped
          , hasVideo : (video && video.video_url)?1:0  // Used in the template to output a delete node to show when post swiped
          , hasImage : (images && images.length)?1:0 // Used in the template to output a delete node to show when post swiped
          , canDelete: (this.get('owner') == EvilEgo.currentUser)
          , newComments : 0
        })
        _.bindAll(this,'addPoint','removePoint','remove','url','getComments')
    } 
  , addPoint: function() {
        var self = this
        $.get(this.url()+'/vote/1').done(function(data){
            var points = data.points
            self.set({points:data.points})
        })
    }
  , removePoint: function() {
        var self = this
        $.get(this.url()+'/vote/-1').done(function(data){
            var points = data.points
            self.set({points:data.points})
        })
    }
  , remove: function() {
        if (this.get('canDelete'))
            this.destroy()
    }
  , getComments: function() {
        var cm = new CommentCollection({post_id: this.get('_id')})
        var cv = new CommentListView(cm)
        cm.fetch().done(cm.render).error(function(){window.location.hash='newsfeed'})
    }
  , url: function() {
      return EvilEgo.dataHost+'/post/'+this.get('_id')
    }
})

PostCollection = Backbone.Collection.extend({
    type: 'newsfeed'
  , model: PostModel

  , initialize: function() {
        var now = (new Date()).getTime()
          , self = this
        this.comparator = function(item) {
            var x = parseInt(item.get('timestamp'))
            return (now - x)
        }
        _.bindAll(this,'setType','fetchPosts')
    }
  , setType: function(type) {
        this.type = type
    }
  , fetchPosts: function(player) {
        //console.log('Fetching posts for '+player)
        var self = this
        switch(this.type) {
            case 'newsfeed':
                this.url = EvilEgo.dataHost+'/user/'+(player||EvilEgo.loggedInUser.get('login'))+'/newsfeed'
                this.trigger('loading')
                this.fetch({success: function(){self.trigger('load_done')},error: function(err) {self.trigger('load_error')}})
            break
        }
        return this
    }
})

PostFormModel = Backbone.Model.extend({
    defaults: {
        owner:'Nobody'
      , missions: []
      , images: []
    }
  , url: function() {
        return EvilEgo.dataHost+'/post/'+this.get('owner')
    }
  , initialize: function(defaults) {
        this.set(defaults)
    }
})
