PostModel = Backbone.Model.extend({
    defaults: {
        title: 'Default Title'
      , owner: 'Nobody'
      , post:  'This is an empty post'
      , isEmpty: true
    }
  , fetchTimer: null
  , initialize: function(defaults) {
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
        var video = this.get('video')
          , images = this.get('images')
        // Used in the template to show/hide the point voting section
        this.set({
            canVote  : ((images && images.length) || (video && video.video_url))?1:0 // Used in the template to output a delete node to show when post swiped
          , hasVideo : (video && video.mobile_video_url)?1:0  // Used in the template to output a delete node to show when post swiped
          , hasImage : (images && images.length)?1:0 // Used in the template to output a delete node to show when post swiped
          , canDelete: (this.get('owner').toLowerCase() == EvilEgo.currentUser.toLowerCase())
          , newComments : 0
        })
        //console.log(this.get('canDelete'))
        _.bindAll(this,'addPoint','removePoint','remove','url')
    } 
  , addPoint: function() {
        var self = this
        return $.get(this.url()+'/vote/1').done(function(data){
            var points = data.points
            self.set({points:data.points})
        })
    }
  , removePoint: function() {
        var self = this
        return $.get(this.url()+'/vote/-1').done(function(data){
            var points = data.points
            self.set({points:data.points})
        })
    }
  , remove: function() {
        if (this.get('canDelete'))
            return this.destroy().done(function() {
                //console.log('Delete done')
            }).error(function() {
                //console.log('Delete error')
            })
        else return $.Deferred().fail()
    }
  , url: function() {
      return EvilEgo.dataHost+'/post/'+this.get('_id')
    }
})

PostCollection = Backbone.Collection.extend({
    type: 'newsfeed'
  , model: PostModel
  , lastPlayer: null
  , initialize: function() {
        var now = (new Date()).getTime()
          , self = this
        this.comparator = function(item) {
            var x = parseInt(item.get('timestamp'))
            return (now - x)
        }
        _.bindAll(this,'setType','fetchPosts')
        //this.bind('add',function(post) { post.collection = this })
        //this.bind('remove',function(post) { delete post['collection'] })
        //this.bind('reset',function() { var self=this; _(this.models).each(function(item){item.collection = self})})
    }
  , setType: function(type) {
        this.type = type
    }
  , fetchPosts: function(player,page) {
        //console.log('Fetching posts for '+player)
        var self = this
        if (player) this.lastPlayer = player
        switch(this.type) {
            case 'newsfeed':
                if (this.fetchTimer) return
                this.url = EvilEgo.dataHost+'/user/'+(this.lastPlayer||EvilEgo.loggedInUser.get('login'))+'/newsfeed'
                var d = this.fetch({data:{page:page||0},add:(page&&page>0)}).done(function(data) {
                    //console.log('Done fetching newsfeed')
                    clearTimeout(self.fetchTimer)
                    self.fetchTimer = null
                }).error(function() {
                    //console.log('Failed fetching newsfeed')
                    clearTimeout(self.fetchTimer)
                    self.fetchTimer = null
                })
                this.fetchTimer = setTimeout(d.fail,30000) // 30 second timeout for getting newsfeeds
                return d
            break
        }
        return this
    }
  , logout: function() {
        return $.ajax({
            url: '/logout'
          , type: "get"
        })
    }
})

PostFormModel = Backbone.Model.extend({
    defaults: {
        owner:'Nobody'
      , missions: []
      , images: []
      , video: ''
    }
  , url: function() {
        return EvilEgo.dataHost+'/post/'+this.get('owner')
    }
  , initialize: function(defaults) {
        this.set(defaults)
    }
})
